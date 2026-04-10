# Security Policy

## Reporting a Vulnerability

Matlens はプロトタイプ段階のプロダクトですが、セキュリティの問題は真剣に取り扱います。脆弱性を発見した場合は、**公開 Issue を作成せず**、メンテナーに直接ご連絡ください。

- 連絡先: リポジトリオーナー ([@BoxPistols](https://github.com/BoxPistols))
- 返答 SLA:
  - 受領の確認: **48時間以内**
  - 修正方針の共有: **7日以内**
  - 重大度（High/Critical）のパッチリリース: **14日以内**

公開リポジトリのため、報告内容には再現手順と影響範囲を含めてください。可能であれば CVSS v3.1 スコアも添えていただけると助かります。

## Supported Versions

`main` ブランチが唯一のサポート対象です。過去の git tag / 古いデプロイでの問題は、`main` でもまだ再現するかを確認してから報告してください。

## セキュリティ実装状況

現時点で Matlens が講じている主な対策を以下にまとめます。詳細は該当ファイルをご参照ください。

### Input Validation
- `api/lib/validation.js` にすべての API 入力の検証ロジックを集約
- すべての文字列入力は NFKC 正規化 + null byte 拒否
- `provider`, `category` はアローリスト、`topK` は数値範囲チェック
- `application/json` 以外の Content-Type は 415 で拒否（CSRF の simple request 対策）
- 材料インジェストは 1 リクエスト最大 500 件、1 フィールド最大 2000 文字

### XML / MaiML
- `src/services/maiml.ts` で `MAIML_MAX_BYTES = 10MB` の上限
- `<!DOCTYPE>` を明示的に拒否（XXE / Billion Laughs 対策）
- ブラウザ標準 `DOMParser` を使用（外部エンティティをデフォルトで解決しない）

### Markdown / HTML サニタイゼーション
- `src/services/safeMarkdown.ts` で `marked` + `isomorphic-dompurify`
- `<script>`, `<iframe>`, `<object>`, `on*` 属性、`javascript:` URI はすべて除去
- LLM 出力を innerHTML にレンダリングする全箇所でこの関数を経由

### HTTP Security Headers (`vercel.json`)
- `Content-Security-Policy` (self + 明示的な connect-src アローリスト)
- `X-Frame-Options: SAMEORIGIN` + CSP `frame-ancestors 'self'` (クリックジャッキング対策。Storybook の自己 iframe を許可しつつ外部埋め込みはブロック)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (HSTS, 1 年)
- `Permissions-Policy` でカメラ・マイク・位置情報等を無効化

### Rate Limiting
- `api/lib/ratelimit.js` で Upstash Redis + in-memory fallback
- 1 IP あたり `DAILY_LIMIT`（デフォルト 30 回/日）

### 秘密情報管理
- `.env.local` は `.gitignore` 済み
- ユーザー自身の API キーは `sessionStorage` ベースで一時保持
- サーバーログに API キーを出力しない（`console.error` は stack のみ）

### エラー情報漏洩防止
- サーバー側は `console.error` で詳細を記録
- クライアントには一般化したメッセージのみ返す（stack / 内部パスを含めない）

### Error Boundary
- `src/components/ErrorBoundary` で各 AI メッセージを個別にラップ
- 壊れた Markdown がチャット全体のレンダリングをクラッシュさせないように

## 既知の未対応項目 / 今後の計画

- [ ] CORS を Matlens の本番 Origin に限定（現状は `*`）
- [ ] CSP に nonce ベースの `script-src` (現状は `'unsafe-inline'`)
- [ ] Vercel BotID / Vercel Firewall の導入検討
- [ ] 依存関係の自動監査 (Dependabot / Renovate)
- [ ] MaiML 来歴データの SHA-256 ハッシュ保持
- [ ] プライバシーポリシーの整備

優先度の高い順に PR で対応していきます。
