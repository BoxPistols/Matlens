#!/usr/bin/env bash
# measure-team-experience.sh
#
# 5/18 着任後、本番 Vue リポ + 関連社内リポで実行。
# 各 author の React / Vue / TypeScript commit 数を Git 履歴から実測する。
# Issue #113 タスク 2 (チーム React 経験実測) の自動化部分。
#
# 申告ベースは信用せず Git ログで実測することで、ペアプロ計画の必要性を
# 客観的に判断できる材料にする。
#
# 使い方:
#   cd /path/to/repo
#   bash /path/to/matlens/docs/migration-audit/scripts/measure-team-experience.sh [SINCE]
#
# SINCE は省略可。デフォルトは直近 24 ヶ月。
# 例: 2024-01-01 形式の日付を渡せる。
#
# 出力: 標準出力に Markdown テーブル。実名が含まれるので 取扱い注意
#        (社内別レポへ転記し、Matlens にコピーする際は仮名化すること)

set -euo pipefail

if [ ! -d ".git" ]; then
  echo "Error: $(pwd) is not a git repo." >&2
  exit 1
fi

SINCE="${1:-$(date -v-24m +%Y-%m-%d 2>/dev/null || date -d '24 months ago' +%Y-%m-%d 2>/dev/null || echo '2024-05-15')}"

echo "# Team React/Vue Experience ($(date +%Y-%m-%d))"
echo
echo "Repo: $(git remote get-url origin 2>/dev/null || echo '(no remote)')"
echo "Since: $SINCE"
echo
echo "⚠️ **本出力には実名が含まれる**。社内別レポへ転記後、Matlens 側では仮名化（M1, M2, ...）して扱うこと。"
echo

# author ごとに React/Vue/TS commit 数を数える
# React commit = .tsx / .jsx ファイル に touch した commit
# Vue commit = .vue ファイル に touch した commit
# TS commit = .ts ファイル に touch した commit

echo "## 全 author の commit 数（直近期間）"
echo
echo "| Author | Total | React (.tsx/.jsx) | Vue (.vue) | TS (.ts) | 判定 |"
echo "|---|---:|---:|---:|---:|---|"

# git shortlog で author 一覧
git shortlog -sn --since="$SINCE" | while read -r count author_with_count; do
  AUTHOR=$(echo "$count $author_with_count" | sed 's/^[[:space:]]*[0-9]*[[:space:]]*//')
  TOTAL=$(git log --since="$SINCE" --author="$AUTHOR" --oneline 2>/dev/null | wc -l | awk '{print $1}')
  REACT=$(git log --since="$SINCE" --author="$AUTHOR" --name-only --pretty=format: 2>/dev/null | grep -cE '\.(tsx|jsx)$' || true)
  VUE=$(git log --since="$SINCE" --author="$AUTHOR" --name-only --pretty=format: 2>/dev/null | grep -cE '\.vue$' || true)
  TS=$(git log --since="$SINCE" --author="$AUTHOR" --name-only --pretty=format: 2>/dev/null | grep -cE '\.ts$' || true)

  # 経験判定
  if   [ "$REACT" -ge 1000 ]; then LEVEL="専門"
  elif [ "$REACT" -ge 100 ];  then LEVEL="実務可"
  elif [ "$REACT" -ge 1 ];    then LEVEL="基礎"
  else                              LEVEL="未経験"
  fi

  printf "| %s | %s | %s | %s | %s | %s |\n" "$AUTHOR" "$TOTAL" "$REACT" "$VUE" "$TS" "$LEVEL"
done

echo
echo "## 経験レベル定義"
echo
echo "- **専門**: React/TSX commit 1000+"
echo "- **実務可**: React/TSX commit 100-999"
echo "- **基礎**: React/TSX commit 1-99 (チュートリアル / 短期実験のみ)"
echo "- **未経験**: React/TSX commit 0"
echo
echo "## 注意事項"
echo
echo "- 本数値は **commit 数** であり、行数や品質ではない。merge commit や 1 行変更も 1 とカウントする"
echo "- 補助指標として「ファイル touch 数」を別途出している"
echo "- 結局のところ **対話で「過去最大の React プロジェクト規模」を聞くのが最重要**"
echo "  (このスクリプトは「申告と Git 履歴に明らかな乖離があるか」をチェックする補助ツール)"
echo
echo "## 反映先"
echo
echo "- 仮名マッピング表（社内別レポ）"
echo "- Matlens の docs/migration-audit/02-team-experience-template.md（**仮名のみ転記**）"
echo "- ADR-0018「想定反論と切り返し」の "BE 主体に React は無理" の項"
