#!/usr/bin/env bash
# =============================================================================
#  Matlens — オールインワン セットアップ & 起動スクリプト
#  使い方: bash start.sh
# =============================================================================
set -euo pipefail

# ── カラー定義 ───────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}   $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; }
step()    { echo -e "\n${BOLD}${BLUE}▶ $*${RESET}"; }

# ── バナー ───────────────────────────────────────────────────────────────────
echo -e "${BOLD}"
cat << 'BANNER'
 __  __       _   ____  ____
|  \/  | __ _| |_|  _ \| __ )
| |\/| |/ _` | __| | | |  _ \
| |  | | (_| | |_| |_| | |_) |
|_|  |_|\__,_|\__|____/|____/
  研究・実験データ管理システム v3
BANNER
echo -e "${RESET}"
echo "============================================================"
echo ""

# ── スクリプトのディレクトリを基準に動作 ────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── 設定 ────────────────────────────────────────────────────────────────────
PORT="${MATLENS_PORT:-8080}"
HOST="${MATLENS_HOST:-localhost}"
INDEX_FILE="index.html"

# ── Step 1: index.html の存在確認 ────────────────────────────────────────────
step "Step 1/4 — ファイル確認"
if [[ ! -f "$INDEX_FILE" ]]; then
  error "index.html が見つかりません: $SCRIPT_DIR/$INDEX_FILE"
  exit 1
fi
FILE_SIZE=$(wc -c < "$INDEX_FILE" | tr -d ' ')
success "index.html を確認しました ($(( FILE_SIZE / 1024 )) KB)"

# ── Step 2: ランタイム検出 ───────────────────────────────────────────────────
step "Step 2/4 — サーバーランタイムを検出"

SERVER_CMD=""
SERVER_TYPE=""

# 優先順位: Node.js serve > Python 3 > Python 2 > Ruby > PHP
if command -v node &>/dev/null && node -e "require('serve')" &>/dev/null 2>&1; then
  SERVER_CMD="node -e \"const handler = require('serve').handler; const http = require('http'); http.createServer((req,res) => handler(req,res,{public:'$SCRIPT_DIR'})).listen($PORT, '$HOST', () => console.log('Ready'));\""
  SERVER_TYPE="Node.js (serve)"
elif command -v npx &>/dev/null; then
  SERVER_CMD="npx --yes serve@latest . --listen $PORT --no-clipboard"
  SERVER_TYPE="npx serve"
elif command -v python3 &>/dev/null; then
  PY_VER=$(python3 --version 2>&1)
  SERVER_CMD="python3 -m http.server $PORT --bind $HOST"
  SERVER_TYPE="Python 3 ($PY_VER)"
elif command -v python &>/dev/null && python -c "import sys; assert sys.version_info[0]==3" &>/dev/null 2>&1; then
  SERVER_CMD="python -m http.server $PORT --bind $HOST"
  SERVER_TYPE="Python 3 (python alias)"
elif command -v python &>/dev/null; then
  SERVER_CMD="python -m SimpleHTTPServer $PORT"
  SERVER_TYPE="Python 2 (SimpleHTTPServer)"
elif command -v ruby &>/dev/null; then
  SERVER_CMD="ruby -run -e httpd . -p $PORT"
  SERVER_TYPE="Ruby WEBrick"
elif command -v php &>/dev/null; then
  SERVER_CMD="php -S $HOST:$PORT"
  SERVER_TYPE="PHP built-in server"
else
  error "利用可能なHTTPサーバーが見つかりません"
  echo ""
  echo "以下のいずれかをインストールしてください:"
  echo "  - Python 3:  https://python.org"
  echo "  - Node.js:   https://nodejs.org"
  echo "  - Ruby:      https://ruby-lang.org"
  exit 1
fi

success "サーバー: $SERVER_TYPE"
success "ポート:   $PORT"

# ── Step 3: ポート使用確認 ────────────────────────────────────────────────────
step "Step 3/4 — ポート確認"

port_in_use() {
  if command -v lsof &>/dev/null; then
    lsof -i ":$1" &>/dev/null
  elif command -v netstat &>/dev/null; then
    netstat -an 2>/dev/null | grep -q ":$1 "
  else
    return 1
  fi
}

if port_in_use "$PORT"; then
  warn "ポート $PORT は既に使用中です — 代替ポートを探します..."
  for ALT in 8081 8082 8083 3000 3001 5000 5500; do
    if ! port_in_use "$ALT"; then
      PORT=$ALT
      info "代替ポート $PORT を使用します"
      # コマンドのポート番号を更新
      SERVER_CMD="${SERVER_CMD/8080/$PORT}"
      break
    fi
  done
fi

URL="http://$HOST:$PORT/index.html"
success "URL: $URL"

# ── Step 4: ブラウザを開いてサーバーを起動 ──────────────────────────────────
step "Step 4/4 — ブラウザを起動 & サーバーを開始"

# ブラウザを開く関数
open_browser() {
  local url="$1"
  sleep 1.2  # サーバー起動を待つ
  if command -v open &>/dev/null; then      # macOS
    open "$url"
  elif command -v xdg-open &>/dev/null; then  # Linux
    xdg-open "$url" &>/dev/null &
  elif command -v wslview &>/dev/null; then   # WSL
    wslview "$url" &>/dev/null &
  elif command -v cmd.exe &>/dev/null; then   # Git Bash / Windows
    cmd.exe /c "start $url" &>/dev/null &
  else
    warn "ブラウザを自動で開けませんでした"
    echo "  手動で開いてください: $URL"
  fi
}

# シグナルハンドラ: Ctrl+C で綺麗に終了
cleanup() {
  echo ""
  info "サーバーを停止しています..."
  kill "$SERVER_PID" 2>/dev/null || true
  success "Matlens を終了しました"
  exit 0
}
trap cleanup INT TERM

# ブラウザを非同期で開く
open_browser "$URL" &
BROWSER_PID=$!

echo ""
echo -e "${GREEN}============================================================${RESET}"
echo -e "${BOLD}  Matlens が起動しました！${RESET}"
echo -e "${GREEN}============================================================${RESET}"
echo ""
echo -e "  ${BOLD}URL:${RESET}    ${CYAN}${URL}${RESET}"
echo -e "  ${BOLD}停止:${RESET}   Ctrl + C"
echo ""
echo -e "${YELLOW}  ※ ブラウザが自動で開きます...${RESET}"
echo ""

# サーバー起動
eval "$SERVER_CMD" &
SERVER_PID=$!

# サーバーが起動したか確認（最大5秒待機）
for i in {1..10}; do
  sleep 0.5
  if port_in_use "$PORT"; then
    success "サーバーが起動しました (PID: $SERVER_PID)"
    break
  fi
done

# サーバープロセスを待機
wait "$SERVER_PID" 2>/dev/null || true
