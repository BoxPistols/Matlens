#!/usr/bin/env bash
# verify-agnostic.sh
#
# Issue #108 / ADR-0016 / ADR-0018 の framework-agnostic 境界を検証する。
# src/domain/ および src/infra/repositories/interfaces/ に React / Vue 等の
# UI フレームワーク依存が混入していないかを grep で確認し、問題があれば
# 非ゼロ終了する。
#
# また A ランク資産（純 TS で再利用可能なモジュール）の SLOC を集計し、
# Vue/Nuxt 移植時の「再利用可能領域」を可視化する。
#
# 使い方: pnpm verify:agnostic

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== Framework-agnostic 境界の検証 ==="
echo

EXIT_CODE=0

check_no_imports() {
  local target_dir="$1"
  local pattern="$2"
  local label="$3"
  if grep -rEn "$pattern" "$target_dir" --include='*.ts' --include='*.tsx' 2>/dev/null; then
    echo "❌ $target_dir に $label が見つかりました（framework-agnostic 違反）"
    EXIT_CODE=1
  else
    echo "✅ $target_dir に $label なし"
  fi
}

# 1. domain は UI フレームワーク禁止
check_no_imports "src/domain"                          "from\\s+['\"](react|react-dom|vue|nuxt)['\"]" "React/Vue import"
check_no_imports "src/domain"                          "from\\s+['\"]@tanstack/(react|vue)-query['\"]" "TanStack Query import"
check_no_imports "src/domain"                          "from\\s+['\"]@/components" "components import"

# 2. infra/repositories/interfaces も同上
check_no_imports "src/infra/repositories/interfaces"   "from\\s+['\"](react|react-dom|vue|nuxt)['\"]" "React/Vue import"

# 3. services/ は React/Vue 直接 import 禁止（ブラウザ API は許容）
check_no_imports "src/services"                        "from\\s+['\"]react['\"]"   "React import"
check_no_imports "src/services"                        "from\\s+['\"]vue['\"]"     "Vue import"

echo
echo "=== A ランク資産の SLOC（移植可能領域の規模可視化）==="
echo

count_loc() {
  local target_dir="$1"
  local label="$2"
  if [ -d "$target_dir" ]; then
    local loc
    loc=$(find "$target_dir" \( -name '*.ts' -o -name '*.tsx' \) -not -name '*.test.ts' -not -name '*.test.tsx' -not -name '*.stories.tsx' 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
    printf "%-50s %s lines\n" "$label" "${loc:-0}"
  fi
}

count_loc "src/domain"                          "domain (型 / Zod schema / 定数)"
count_loc "src/infra/repositories/interfaces"   "infra/repositories/interfaces (DI 境界)"
count_loc "src/infra/repositories/mock"         "infra/repositories/mock (純 TS 実装)"
count_loc "src/services"                        "services (純 TS シリアライザ等)"
count_loc "src/features/cutting/utils"          "features/cutting/utils (FFT, Taylor 等)"
count_loc "src/features/dashboard/utils"        "features/dashboard/utils (KPI 集計)"
count_loc "src/features/tools/utils"            "features/tools/utils (摩耗ステータス)"
count_loc "src/features/tests/matrix"           "features/tests/matrix (異常率 / 顧客集計)"
count_loc "src/features/damage/similarity.ts"   "features/damage/similarity.ts"
count_loc "src/features/cutting/components/scatterMappings.ts" "features/cutting scatterMappings"
count_loc "design-tokens/src"                   "design-tokens/src (CSS 変数 + Tailwind)"
count_loc "src/shared/utils"                    "shared/utils (汎用ユーティリティ)"

echo
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ framework-agnostic 境界は維持されています"
else
  echo "❌ 境界違反を検出しました。ESLint エラー (no-restricted-imports) も確認してください"
fi

exit $EXIT_CODE
