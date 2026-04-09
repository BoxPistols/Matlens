#!/usr/bin/env bash
# =============================================================================
#  Matlens — 環境診断スクリプト
#  使い方: bash scripts/check-env.sh
# =============================================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

ok()   { echo -e "  ${GREEN}✓${RESET} $*"; }
ng()   { echo -e "  ${RED}✗${RESET} $*"; }
warn() { echo -e "  ${YELLOW}△${RESET} $*"; }
info() { echo -e "  ${CYAN}→${RESET} $*"; }

echo ""
echo -e "${BOLD}Matlens 環境診断レポート${RESET}"
echo "=============================="
echo ""

SCORE=0
TOTAL=0

check() {
  TOTAL=$((TOTAL + 1))
  if eval "$2" &>/dev/null 2>&1; then
    ok "$1: $(eval "$3" 2>/dev/null || echo 'OK')"
    SCORE=$((SCORE + 1))
  else
    ng "$1: 見つかりません"
    [ -n "$4" ] && info "インストール: $4"
  fi
}

echo -e "${BOLD}▶ サーバーランタイム (1つあれば起動可能)${RESET}"
check "Python 3"  "command -v python3"  "python3 --version"  "https://python.org"
check "Python"    "python --version 2>&1 | grep -q 'Python 3'"  "python --version"  ""
check "Node.js"   "command -v node"  "node --version"   "https://nodejs.org"
check "npx"       "command -v npx"   "npx --version"    ""
check "Ruby"      "command -v ruby"  "ruby --version | cut -d' ' -f1,2"  ""
check "PHP"       "command -v php"   "php --version | head -1 | cut -d' ' -f1,2"  ""

echo ""
echo -e "${BOLD}▶ ブラウザ${RESET}"
if [[ "$OSTYPE" == "darwin"* ]]; then
  check "macOS open"  "command -v open"  "echo 'available'"  ""
elif command -v xdg-open &>/dev/null; then
  ok "Linux xdg-open: available"
elif command -v wslview &>/dev/null; then
  ok "WSL wslview: available"
else
  warn "ブラウザの自動起動: 手動でURLを開いてください"
fi

echo ""
echo -e "${BOLD}▶ ネットワーク${RESET}"
if curl -s --connect-timeout 3 https://cdn.tailwindcss.com/tailwind.min.css -o /dev/null; then
  ok "インターネット接続: CDNにアクセス可能"
else
  warn "インターネット接続: CDNにアクセスできません (オフライン環境)"
  info "オフラインでは一部機能 (Tailwind CSS, Chart.js等) が利用できません"
fi

# ポート確認
PORT=8080
if lsof -i ":$PORT" &>/dev/null 2>&1 || netstat -an 2>/dev/null | grep -q ":$PORT "; then
  warn "ポート $PORT: 使用中 (start.sh が自動で代替ポートを選択します)"
else
  ok "ポート $PORT: 利用可能"
fi

echo ""
echo -e "${BOLD}▶ index.html${RESET}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$SCRIPT_DIR/index.html" ]]; then
  SIZE=$(wc -c < "$SCRIPT_DIR/index.html" | tr -d ' ')
  ok "index.html: $(( SIZE / 1024 )) KB"
else
  ng "index.html: 見つかりません ($SCRIPT_DIR/index.html)"
fi

echo ""
echo "=============================="
echo -e "${BOLD}スコア: $SCORE / $TOTAL${RESET}"
echo ""

if [[ $SCORE -ge 2 ]]; then
  echo -e "${GREEN}✓ 起動可能です。bash start.sh を実行してください。${RESET}"
elif [[ $SCORE -ge 1 ]]; then
  echo -e "${YELLOW}△ 最低限の環境は整っています。bash start.sh を試してください。${RESET}"
else
  echo -e "${RED}✗ サーバーを起動できる環境がありません。${RESET}"
  echo "  Python 3 か Node.js をインストールしてください:"
  echo "  Python 3: https://python.org"
  echo "  Node.js:  https://nodejs.org"
fi
echo ""
