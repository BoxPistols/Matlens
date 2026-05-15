#!/usr/bin/env bash
# audit-vue-codebase.sh
#
# 5/18 着任後、本番 Vue/Nuxt リポのルートで実行する。
# Issue #113 タスク 1 (既存 Vue コードベース棚卸し) の自動計測部分。
#
# 出力は Markdown テーブル形式で標準出力に。
# docs/migration-audit/01-vue-codebase-template.md にコピペして人間が判断 / 加筆。
#
# 使い方:
#   cd /path/to/vue-repo
#   bash /path/to/matlens/docs/migration-audit/scripts/audit-vue-codebase.sh
#
# 依存: bash, find, wc, awk, git, jq (optional)

set -euo pipefail

if [ ! -d ".git" ]; then
  echo "Error: $(pwd) is not a git repo. Run this in the Vue/Nuxt repo root." >&2
  exit 1
fi

count_files() { find . -name "$1" -not -path '*/node_modules/*' -not -path '*/dist/*' -not -path '*/.nuxt/*' 2>/dev/null | wc -l | awk '{print $1}'; }
count_loc()   { find . -name "$1" -not -path '*/node_modules/*' -not -path '*/dist/*' -not -path '*/.nuxt/*' 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}'; }

echo "# Vue Codebase Audit ($(date +%Y-%m-%d))"
echo
echo "Repo: $(git remote get-url origin 2>/dev/null || echo '(no remote)')"
echo "Branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
echo "HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
echo

echo "## 規模"
echo
echo "| 指標 | 値 |"
echo "|---|---:|"
printf "| .vue ファイル数 | %s |\n" "$(count_files '*.vue')"
printf "| .vue 合計行数 | %s |\n" "$(count_loc '*.vue')"
printf "| .ts ファイル数 | %s |\n" "$(count_files '*.ts')"
printf "| .ts SLOC | %s |\n" "$(count_loc '*.ts')"
printf "| .js ファイル数 | %s |\n" "$(count_files '*.js')"
printf "| .js SLOC | %s |\n" "$(count_loc '*.js')"
echo

# Nuxt の pages または vue-router 設定からルート数推定
echo "## ルート数（推定）"
echo
if [ -d "pages" ]; then
  ROUTES=$(find pages -name '*.vue' -not -path '*/node_modules/*' 2>/dev/null | wc -l | awk '{print $1}')
  echo "Nuxt pages/ 配下の .vue 数: **$ROUTES**"
elif [ -d "src/pages" ]; then
  ROUTES=$(find src/pages -name '*.vue' -not -path '*/node_modules/*' 2>/dev/null | wc -l | awk '{print $1}')
  echo "src/pages/ 配下の .vue 数: **$ROUTES**"
elif [ -d "app/pages" ]; then
  ROUTES=$(find app/pages -name '*.vue' -not -path '*/node_modules/*' 2>/dev/null | wc -l | awk '{print $1}')
  echo "app/pages/ 配下の .vue 数: **$ROUTES**"
else
  echo "pages/ 検出失敗。vue-router の routes 配列を手動カウント要。"
fi
echo

echo "## components/"
echo
if [ -d "components" ]; then
  COMP=$(find components -name '*.vue' 2>/dev/null | wc -l | awk '{print $1}')
  echo "components/ 配下の .vue 数: **$COMP**"
elif [ -d "src/components" ]; then
  COMP=$(find src/components -name '*.vue' 2>/dev/null | wc -l | awk '{print $1}')
  echo "src/components/ 配下の .vue 数: **$COMP**"
fi
echo

echo "## Pinia store"
echo
STORE=$(grep -rl "defineStore" --include='*.ts' --include='*.vue' --exclude-dir=node_modules --exclude-dir=dist 2>/dev/null | wc -l | awk '{print $1}')
echo "defineStore を含むファイル: **$STORE**"
echo

echo "## テスト"
echo
echo "| 種別 | 数 |"
echo "|---|---:|"
printf "| *.spec.ts (ユニット推定) | %s |\n" "$(count_files '*.spec.ts')"
printf "| *.test.ts (ユニット推定) | %s |\n" "$(count_files '*.test.ts')"
printf "| *.e2e.ts (E2E 推定) | %s |\n" "$(count_files '*.e2e.ts')"
echo "Playwright spec の検出は repo によって異なる。tests/e2e/ や e2e/ ディレクトリも確認してください。"
echo

echo "## 依存"
echo
if [ -f "package.json" ]; then
  if command -v jq >/dev/null 2>&1; then
    echo "### Vue/Nuxt 関連依存"
    jq -r '.dependencies + .devDependencies | to_entries | map(select(.key | test("vue|nuxt|pinia|@vueuse"))) | .[] | "- `\(.key)`: \(.value)"' package.json 2>/dev/null || echo "(jq parse failed)"
  else
    echo "(jq 未インストール、手動で package.json を確認)"
  fi
fi
echo

echo "## 直近 24 ヶ月の commit 統計"
echo
SINCE=$(date -v-24m +%Y-%m-%d 2>/dev/null || date -d '24 months ago' +%Y-%m-%d 2>/dev/null || echo '2024-05-15')
TOTAL_COMMITS=$(git log --since="$SINCE" --oneline 2>/dev/null | wc -l | awk '{print $1}')
echo "総 commit 数（直近 24 ヶ月、$SINCE 以降）: **$TOTAL_COMMITS**"
echo

# 集計サマリ
TOTAL_SLOC=$(($(count_loc '*.vue') + $(count_loc '*.ts') + $(count_loc '*.js')))
echo "## 集計サマリ"
echo
echo "**合計 SLOC**: $TOTAL_SLOC"
echo
echo "**破棄コスト見積（保守的最大値）**:"
if [ -n "${ROUTES:-}" ] && [ "$ROUTES" -gt 0 ]; then
  echo "- $ROUTES 画面 × 0.75 人日 = $(awk "BEGIN{print $ROUTES*0.75}") 人日"
fi
echo "- $TOTAL_SLOC SLOC ÷ 100 = $(awk "BEGIN{print $TOTAL_SLOC/100}") 人日"
echo
echo "→ ADR-0018 「想定反論と切り返し」の "Vue でもう書き始めた" の項に転記。"
