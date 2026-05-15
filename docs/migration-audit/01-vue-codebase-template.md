# 棚卸し 1: 既存 Vue コードベース実測

**5/18 着任後、本番 Vue リポへの読取アクセスを得たら最優先で実行。**

## 自動計測

```sh
# 本番 Vue リポのルートで実行
bash <path-to-matlens>/docs/migration-audit/scripts/audit-vue-codebase.sh
```

出力は標準出力に Markdown テーブル。下表のプレースホルダに転記する。

## 実測結果サマリ（埋める）

計測日: `YYYY-MM-DD`
対象リポ: `M社 本番 Vue/Nuxt リポ` (リポ名 / commit hash 仮名化)

### 規模

| 指標 | 値 | メモ |
|---|---:|---|
| `.vue` ファイル数 | ___ | |
| `.vue` SFC 内 SLOC (script / template / style 合計) | ___ | |
| `.ts` SLOC (非 .vue) | ___ | |
| `.js` SLOC (非 .vue) | ___ | |
| **合計 SLOC** | ___ | |
| `components/` 配下 .vue 数 | ___ | 再利用部品 |
| `pages/` または router 配下のルート総数 | ___ | dynamic route 含む |
| Pinia store の数 | ___ | |

### 品質

| 指標 | 値 | メモ |
|---|---:|---|
| ユニットテスト数 (`*.spec.ts` / `*.test.ts`) | ___ | |
| ユニットテストカバレッジ (%) | ___ | `pnpm test:coverage` 等で |
| Playwright spec 数 | ___ | E2E |
| E2E でカバーされる主要画面率 (%) | ___ | 仮: spec 数 / pages 数 |

### 依存

| 指標 | 値 | メモ |
|---|---:|---|
| Vue/Nuxt 専用依存 (`@vueuse/*` `pinia` `vue-router` 等) 数 | ___ | |
| 採用済 UI ライブラリ | ___ | 例: PrimeVue, Vuetify, 等 |
| 採用済テスト基盤 | ___ | Vitest? Jest? |
| ビルダ | ___ | Vite? Nuxt? |

### ビルド・実行

| 指標 | 値 | メモ |
|---|---:|---|
| `dev` 起動時間 (cold start) | ___ s | |
| `build` 所要時間 | ___ s | |
| バンドルサイズ (gzip) | ___ KB | |

### API 接続状況

| 指標 | 値 | メモ |
|---|---:|---|
| 実 API に繋がっているエンドポイント数 | ___ | |
| モックのみのエンドポイント数 | ___ | |
| OpenAPI スキーマ有無 | yes/no | |

## 破棄コスト見積

| 計算式 | 値 |
|---|---:|
| 画面 1 枚 = 0.5-1 人日（中央値 0.75）として: ___ 画面 × 0.75 | ___ 人日 |
| SFC SLOC ÷ 100 = 人日換算: ___ ÷ 100 | ___ 人日 |
| **採用する見積（保守的に最大値）** | **___ 人日** |

## 既存 Vue コードの「破棄 / 流用」判定

| 領域 | 流用可能性 | 備考 |
|---|---|---|
| 純 TS ロジック (composables / utils) | A: 移植可 | React 側でほぼそのまま |
| Pinia store の `state` 構造 | B: ロジックは移植可、reactivity は書き直し | Zustand / Jotai 等の API に合わせる |
| Vue 専用 directive / template slot | D: 破棄 | |
| Tailwind utility class | A: そのまま | |
| Playwright spec | A: 8 割再利用 | role/text セレクタ前提 |
| Vitest ユニットテスト | C: 0-2 割再利用 | mount API 差で書き直し多 |

## 反映先

- ADR-0018 「想定反論と切り返し」の "Vue でもう書き始めた" の項
- ADR-0018 「検証」セクションの 5/18-5/24 タスク
