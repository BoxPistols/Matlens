# Phase 0 抽出プレイブック — framework-agnostic 資産の独立化

> Issue #108 / ADR-0018 のリプレイス採否どちらに転んでも価値が残る、Matlens の framework-agnostic 資産を独立パッケージ化するための実行計画。

## 現状（2026-05-03）

### 契約は確立済（本セッション）

- ESLint `no-restricted-imports` で `src/domain/` と `src/infra/repositories/interfaces/` から React / Vue / TanStack Query / UI コンポーネントの import を **error レベルで禁止**
- `src/services/` も React / Vue 直接 import を warn レベルで禁止
- 検証スクリプト `pnpm verify:agnostic` で grep ベースの自動チェック + SLOC 計測

これにより **「framework-agnostic 境界が壊されない」契約は今すぐ機能している**。物理的な切り出しはまだだが、契約だけ先に固定した状態。

### 移植可能資産の規模（2026-05-03 時点、`pnpm verify:agnostic` 出力）

| カテゴリ | SLOC | 備考 |
|---|---:|---|
| `src/domain/` | 856 | 型 + Zod schema + 定数（純 TS） |
| `src/infra/repositories/interfaces/` | 334 | DI 境界（純 TS） |
| `src/infra/repositories/mock/` | 1029 | InMemoryTable + フィルタ（純 TS） |
| `src/services/` | 1942 | MaiML / Bayesian / Empirical / nlQuery / Validate / Diff |
| `src/features/cutting/utils/` | 792 | FFT / Taylor / Stability Lobe / Kc / standards / waveformCsv |
| `src/features/dashboard/utils/` | 345 | KPI 集計 |
| `src/features/tools/utils/` | 63 | wearStatus |
| `src/features/tests/matrix/` | 1007 | abnormalRatio / customerMatrix（HeatmapMatrix.tsx は除外想定） |
| `design-tokens/src/` | 412 | CSS 変数 + Tailwind tokens |
| `src/shared/utils/` | 51 | 汎用 utility |

**合計 ~6800 SLOC** が「Vue でも React でも変更なしで使える」資産。

### 既に分離済の純関数

以下は本セッションまでに**設計から純関数として書かれている**ため、抽出時の追加作業がほぼない:

- `src/services/maiml.ts` の serializer 部 (parser は DOMParser 引数注入で SSR 対応済)
- `src/services/maimlProject.ts` (材料 / 案件 / 試験集合の MaiML)
- `src/services/maimlValidate.ts` (DOMParser 引数注入式)
- `src/services/maimlDiff.ts` (LCS ベース)
- `src/services/bayesianOpt.ts` (Cholesky + EI)
- `src/services/empiricalFormulas.ts` (Hall-Petch / LM / JMAK / ROM)
- `src/services/nlQueryCompile.ts` (ルールベース正規表現)
- `src/features/cutting/utils/*` (全 6 ファイル)
- `src/features/cutting/components/scatterMappings.ts` (色 / 軸 / マーカー mapping)
- `src/features/damage/similarity.ts` (Jaccard ベース類似度)
- `src/features/dashboard/utils/opsMetrics.ts` (KPI 集計)
- `src/features/tools/utils/wearStatus.ts` (ISO 3685 摩耗分類)
- `src/features/tests/matrix/abnormalRatio.ts` / `customerMatrix.ts`

## 物理的な切り出し（Phase 0 本実施）

リプレイス採用時 (ADR-0018 Accepted) または現リポを monorepo 化したい時に実施する作業。
**所要 1.5-2 人日**、本セッションでは未実施。

### Step 1: pnpm workspace 化（0.3 日）

```yaml
# pnpm-workspace.yaml（新規）
packages:
  - 'packages/*'
  - '.'  # ルートも 1 つの package として扱う
```

### Step 2: `packages/domain/` を切り出し（0.5 日）

```
packages/
└── domain/
    ├── package.json     # name: "@matlens/domain", main: "src/index.ts"
    ├── tsconfig.json    # composite: true
    ├── src/
    │   ├── types/
    │   ├── schemas/
    │   ├── constants/
    │   └── index.ts
    └── README.md
```

- `src/domain/` を `packages/domain/src/` に移動
- ルート `tsconfig.json` の paths から `@/domain/*` を削除し、代わりに `@matlens/domain` を `packages/domain/src` に解決
- ルート `package.json` の dependencies に `"@matlens/domain": "workspace:*"`
- 全 import を `@/domain/...` → `@matlens/domain` に grep 置換

検証: `pnpm typecheck` `pnpm test --run` `pnpm build` が全部通る

### Step 3: `packages/tokens/` を切り出し（0.3 日）

```
packages/
└── tokens/
    ├── package.json     # name: "@matlens/tokens"
    ├── src/
    │   ├── colorTokens.ts
    │   ├── sizeTokens.ts
    │   ├── shadowStyles.ts
    │   ├── textStyles.ts
    │   └── index.ts
    ├── scripts/
    │   ├── build-plugin.ts
    │   └── generate-tokens-json.ts
    └── README.md
```

- `design-tokens/` を `packages/tokens/` にリネーム
- ルート `tailwind.config` から `packages/tokens/dist/tokens.json` を import
- npm scripts `tokens:build` を `pnpm --filter @matlens/tokens run build` 経由に変更

### Step 4: `packages/maiml/` を切り出し（0.3 日、optional）

最高価値の純 TS 資産（serializer + validator + diff）を独立化:

```
packages/
└── maiml/
    ├── package.json     # name: "@matlens/maiml"
    ├── src/
    │   ├── serializeMaterials.ts
    │   ├── serializeProject.ts
    │   ├── parseMaterials.ts
    │   ├── validate.ts
    │   ├── diff.ts
    │   └── index.ts
    └── README.md
```

これで Vue/Nuxt 側からも `import { serializeProjectToMaiml } from '@matlens/maiml'` で同じ実装を共有できる。

### Step 5: ESLint 境界ルール強化（0.1 日）

抽出後は ESLint で `packages/domain/` への import を `@matlens/domain` 経由のみに強制（相対パス禁止）。

## 移植検証チェックリスト

物理切り出し後、Vue/Nuxt 側で動作するかは以下で確認:

1. **Nuxt の試験プロジェクト**を作成
2. `pnpm link --global` で `@matlens/domain` `@matlens/tokens` `@matlens/maiml` をリンク
3. Nuxt の `composables/` から domain types を import → 型解決 OK
4. `nuxt build` でサーバーサイドビルドが通る（`DOMParser` 引数注入式なので Nitro でも動く）
5. Tailwind `@matlens/tokens` 連携 → 4 テーマの CSS 変数が正しく出る
6. `serializeProjectToMaiml` を Nuxt server route で実行 → MaiML XML 文字列が返る

## ESLint 境界ルールの詳細

`eslint.config.js` の追加ルール:

```js
// src/domain/ と src/infra/repositories/interfaces/ から
// React / Vue / Nuxt / TanStack Query / UI コンポーネントの
// import を error レベルで禁止
{
  files: [
    'src/domain/**/*.{ts,tsx}',
    'src/infra/repositories/interfaces/**/*.{ts,tsx}',
  ],
  rules: {
    'no-restricted-imports': ['error', {
      paths: [
        { name: 'react', message: '...' },
        { name: 'react-dom', message: '...' },
        { name: 'vue', message: '...' },
        { name: 'nuxt', message: '...' },
        { name: '@tanstack/react-query', message: '...' },
        { name: '@tanstack/vue-query', message: '...' },
      ],
      patterns: [
        { group: ['react/*', 'react-dom/*'] },
        { group: ['@/components/*', '@/pages/*'] },
      ],
    }],
  },
},
```

## 関連
- Issue #108（Phase 0 抽出 = 本ドキュメントの実行対象）
- ADR-0016（MaiML をコア要素として位置付け = 切り出しの根拠）
- ADR-0018（リプレイス計画 = 採否どちらでも価値が残る）
- `scripts/verify-agnostic.sh`（境界の自動検証 + SLOC 計測）
