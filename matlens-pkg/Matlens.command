#!/usr/bin/env bash
# =============================================================================
#  Matlens — macOS ダブルクリック起動スクリプト
#  Terminal.app が開いてサーバーが起動します
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT=8080
URL="http://localhost:${PORT}/index.html"

# ポート使用中チェック
if lsof -i ":$PORT" &>/dev/null 2>&1; then
  PORT=8081
  URL="http://localhost:${PORT}/index.html"
fi

echo "============================================"
echo "  Matlens 研究・実験データ管理システム"
echo "============================================"
echo ""
echo "  URL: $URL"
echo "  停止: Ctrl+C"
echo ""

# ブラウザを開く（1秒後）
(sleep 1 && open "$URL") &

# Python 3 でサーバー起動
if command -v python3 &>/dev/null; then
  python3 -m http.server "$PORT" --bind localhost
elif command -v python &>/dev/null; then
  python -m http.server "$PORT" --bind localhost
else
  echo "Python が見つかりません。start.sh を実行してください。"
  read -r -p "Enterキーで終了..."
fi
