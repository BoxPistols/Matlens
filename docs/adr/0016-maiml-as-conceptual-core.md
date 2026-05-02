# ADR-0016: MaiML を「機能の 1 つ」ではなく「アプリのコア要素」として位置付ける

- Status: Accepted
- Date: 2026-05-03
- 関連: ADR-0004 (MaiML を主要エクスポート形式とする), ADR-0007 (連動更新), ADR-0015 (機密化)

## Context

ADR-0004 で MaiML (JIS K 0200:2024) をエクスポートの主形式として採用したが、UI 上では MaiML 操作は 5 つの画面（DetailPage / MaterialListPage / ProjectDetailPage / TestMatrixPage / CellTestList）に散在し、ヘルプ画面の用語集にひっそり登場するだけだった。

一方、Matlens がクライアントに提供する価値は **「MaiML として round-trip 可能な研究データ管理」** にある。export 機能の 1 つとして MaiML を扱う旧 IA では、この価値が UI 上で可視化されていなかった。

5/18 からの本番アプリ参加に向けて kickoff demo として Matlens を提示する際、「MaiML を中核にしたプラットフォーム」という設計思想を一目で伝えたい。

## Decision

1. **MaiML Studio をサイドバーの最上位「コア」セクションに配置**する。CORE バッジ付きで、初回ロード時から展開状態。
2. **すべての MaiML 操作を MaiML Studio に集約**する:
   - Import: drop → preview → commit の 3 段階
   - Export: 4 出口（材料単体 / 一覧バルク / 案件バンドル / 試験集合）を Hub から誘導
   - Inspect: XML 整形表示 + 部分一致検索
   - Validate: parser warning + 将来 XSD 検証
   - Diff: 構造比較
3. **ドメインデータは MaiML 中間表現で round-trip 可能**であることを設計原則とする。Materials / Project Bundle / Test Set の 3 種で実装済（Tests / Damage の inverse parser は将来追加）。
4. **新規データ型を追加する際は、MaiML serializer を同時に追加**するルールを ADR として明文化。
5. **既存ページの MaiML 出口は破壊しない**（DetailPage / ProjectDetailPage / TestMatrixPage の MaiML ボタンは残存）。Studio はエントリポイントの追加であって既存導線の代替ではない。

## Consequences

### 良い点
- MaiML を「目的」として位置付けることで、kickoff demo / 採用議論で一貫した説明力が出る
- 規格準拠（JIS K 0200:2024）のメリットが UI 上で見える
- 全 MaiML 操作の保守箇所が 1 ディレクトリ（`src/features/maiml/`）に集約される
- ラボ計測器 / LIMS 連携の将来拡張が「MaiML Studio に新サブ画面を追加する」シンプルな形に
- フレームワーク非依存設計（Vue/Nuxt 移植可能性）と整合: serializer は純 TS で完結

### 痛い点
- 新規データ型を追加するたびに MaiML serializer の追加コストが発生
- IA がやや特殊（一般的な業務 SaaS は Data 中心、Matlens は Format 中心）→ 新メンバーへの説明が必要
- Validate / Diff のフル実装は別 phase に分離（5/18 着任優先のため Phase 9 で対応）
- Project / TestSet の inverse parser が未実装のため、Studio Import は Materials のみ完全 round-trip

### 中立
- Export Hub は当面「既存ページへ誘導するリンク集」として動作する（Studio 内で直接 export を完結させる UX は次フェーズ）

## 代替案（不採用）

- **MaiML を従来どおり機能の 1 つにとどめる**: kickoff demo で「コアは何か」を示せず、リプレイス提案 #107 の説得力も弱まる
- **MaiML Studio をサイドバーの最下部に置く**: アクセス頻度の問題ではなく**思想を示す位置**として最上位が必須
- **Materials / Tests / Projects 各画面に MaiML タブを追加**: 散在を解消できず、現状の問題をそのまま固定化

## 検証

- 5/18 着任時に「これがコアです」と 30 秒で説明できること
- 5 分 demo（[`docs/demo/onboarding-5min.md`](../demo/onboarding-5min.md)）が止まらず通せること
- 新規開発者が `src/features/maiml/` を読むだけで全 MaiML 操作を把握できること

## 関連
- IA リファクタ計画: `~/.claude/plans/smooth-imagining-twilight.md`
- アーキテクチャ俯瞰: [`docs/architecture/overview.md`](../architecture/overview.md)
- 5 分オンボーディング: [`docs/demo/onboarding-5min.md`](../demo/onboarding-5min.md)
