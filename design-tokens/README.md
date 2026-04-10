# Matlens Design Tokens

Matlens の CSS 変数デザイントークンを **TypeScript の単一ソース** から管理し、
そこから自動的に:

- Figma プラグイン (`figma-plugin/code.js`) — Variables/Styles 登録用
- Tokens Studio JSON (`tokens.json`) — サードパーティプラグイン import 用

を生成するパイプライン。

## 構造

```
design-tokens/
├── src/                     ← 単一ソース (TypeScript)
│   ├── types.ts             型定義 (ColorToken, SpacingToken, ThemeId など)
│   ├── colorTokens.ts       カラートークン 29個 × 4テーマ
│   ├── sizeTokens.ts        Spacing 12個 + Radius 4個 × 4テーマ
│   ├── textStyles.ts        テキストスタイル 9個
│   ├── shadowStyles.ts      シャドウエフェクト 4個
│   └── index.ts             バレルエクスポート
│
├── figma-plugin/            ← Figma プラグイン本体
│   ├── manifest.json        プラグイン マニフェスト
│   ├── code.ts              TS ソース (src/ からインポート)
│   ├── code.js              ビルド成果物 (gitignore しない; Figma が読む)
│   └── tsconfig.json
│
├── scripts/                 ← ビルドスクリプト
│   ├── build-plugin.ts      esbuild で code.ts → code.js にバンドル
│   └── generate-tokens-json.ts  src/ から tokens.json を生成
│
├── tokens.json              ← Tokens Studio 形式 (生成成果物)
└── README.md                ← この README
```

## 使い方

### トークンを編集する

1. `src/` 配下の該当ファイルを編集 (例: 色の追加 → `colorTokens.ts`)
2. ビルドして両方の成果物を更新

```bash
npm run tokens:build          # code.js + tokens.json を両方再生成
npm run tokens:build:figma-plugin  # Figma プラグインのみ
npm run tokens:build:json          # Tokens Studio JSON のみ
```

3. `src/index.css` の CSS 変数も同じ値に合わせる (現状は手動同期)

### Figma への反映

#### A. 専用プラグインで登録 (推奨)

1. Figma で対象ファイルを開く
2. **Menu → Plugins → Development → マニフェストからインポート...**
3. `design-tokens/figma-plugin/manifest.json` を選択
4. プラグイン一覧に「Matlens Design Tokens」が追加される
5. クリックして実行

#### B. Tokens Studio プラグインで import

1. Figma で「Tokens Studio for Figma」プラグインを起動
2. 下部 Tools → Load → Import → `design-tokens/tokens.json` を選択
3. 右上「Styles & Variables」→ Create variables

## 設計原則

### 単一ソースの徹底

色やサイズの値を書くのは `src/*.ts` のいずれか **1 箇所のみ**。
- Figma プラグインは `src/index.ts` からインポートする
- JSON 生成スクリプトも `src/index.ts` からインポートする

同じ値を手書きで複数箇所に書かない。

### 型安全性

すべてのトークンは `src/types.ts` で定義された型に従う。
4 テーマ分の値は `ThemeMap<T>` で強制される:

```ts
values: { light: '#...', dark: '#...', eng: '#...', cae: '#...' }
```

1 テーマでも抜けると TypeScript エラーで気付ける。

### TypeScript ネイティブ実行

ビルドスクリプトは Node 22+ / 25 の native type stripping を利用している。
`tsx` や `ts-node` は不要。素の `node xxx.ts` で TS ファイルを直接実行できる。

### バンドル

Figma プラグインは単一ファイル実行なので、`src/` からの import を解決する
必要がある。esbuild (プロジェクトの既存 devDep) で `iife` フォーマットに
バンドルして `code.js` を生成する。追加のツールチェーン不要。

## 登録される内容

| 種類 | 数量 | 備考 |
|------|------|------|
| Variable Collection: Color Tokens | 29 変数 × 4 モード | accent, ai-col, vec, ok/warn/err, bg/*, text/*, border/focus 等 |
| Variable Collection: Size Tokens | 16 変数 × 4 モード | spacing/0.5〜spacing/12, radius/sm〜radius/xl |
| Text Styles | 9 スタイル | Matlens/Heading/H1〜H3/Subhead, Body/Base/Default, Label/Nav/Badge, Code/Mono |
| Effect Styles | 4 スタイル | Matlens/Shadow/XS〜LG |

## TODO

- [ ] `src/index.css` の CSS 変数との整合性チェックスクリプト
- [ ] Shadow の dark/eng/cae 値対応 (現状 light 値のみ)
- [ ] CI でビルド成果物が最新かをチェック
- [ ] eng/cae テーマ固有の typography (等幅フォント) を Figma プラグインに追加
