# ADR-013: URL 規約・用語 ownership・更新ポリシー（親密化の運用規約）

- ステータス: **Accepted**（2026-04-23 peer と全項目合意）
- 日付: 2026-04-23（初版）/ 2026-04-23（Minor Revision #1）
- 関連 ADR: ADR-012（親密化統合戦略 — Proposed）、ADR-014（統合実行計画 — Proposed）、ADR-007（連動更新ルール）
- 対応 PR: #74（Phase 1 Matlens 側実装）
- 関連 peer / repo: `BoxPistols/machining-fundamentals`

## 改訂履歴

| バージョン | 日付 | 変更点 |
|---|---|---|
| 初版 | 2026-04-23 | URL Contract / Terminology Ownership / Update Policy / Dead Link / Out of Scope を草稿 |
| Minor Revision #1 | 2026-04-23 | URL Contract の term anchor 区切りを `#` → `/` に確定（詳細は本文 §1 末尾） |

---

## 背景

ADR-012 は **親密化の戦略**（レベル 3 を目指す・Phase 0〜4 の段階化）を定めた。
本 ADR は、その実装を支える **運用規約** を定める。

戦略と運用規約を分離する理由:

- 戦略は方向性・ビジョン・代替案の棄却理由を保存する文書
- 運用規約は日々の PR / 章更新 / リンク追加で参照する **契約**
- 両者が 1 ADR に混ざると、運用中に戦略文書を触る頻度が増えて履歴が荒れる

ADR-007 と同じ位置付け（連動更新の日常的ルール）を、親密化固有の軸で用意する。

---

## 決定

以下 5 点を **両プロジェクト間の契約** として明文化する。

### 1. URL Contract（URL 規約の凍結）

machining-fundamentals の URL は hash-based SPA 規約:

```
<base>                          ホーム（未知 id のフォールバック先）
<base>#/chapter/<id>            章詳細（id は '1'..'10' / 'a1'..'a6' / 'c1' 等）
<base>#/chapter/<id>/<term-id>  章内 anchor（term-id は @mc/glossary と揃える）
<base>#/about                   このアプリについて
<base>#/sim                     CFD シミュレーター
```

**保証事項**（peer から宣言済）:
- 章の `id` は原則変更しない（外部リンクを壊さない）
- 既存 1..10 の id は Part A 挿入後も不変（a1〜a6 / c1 は別名前空間で先頭・末尾に追加）
- 未知 `id` は **ホームにフォールバック**（404 画面を出さない）

**Matlens 側の運用**:
- `src/data/glossaryMapping.ts` の `MACHINING_FUNDAMENTALS_BASE_URL` を信頼する
- 定数で差替え可能（staging / CI テスト用）

#### Minor Revision #1（2026-04-23）: term anchor 区切り `#` → `/` に確定

**変更理由**:
- 当初提案は `<base>#/chapter/<id>#<term-id>` だったが、RFC 3986 §3.5 により
  単一 URL は `#` を 1 つしか持てない
- `#/chapter/8#VB` ではブラウザの `location.hash` が
  `/chapter/8#VB` 全体となり、2 段目の `#` は literal 扱い
- peer 側実装で「path-style の `/` 連結のほうが parser がシンプル」と判断し変更
- 2026-04-23 に両 repo で確認・合意

**変更内容**:
- `<base>#/chapter/<id>#<term-id>`（廃案）
- `<base>#/chapter/<id>/<term-id>`（採用）

**既に配置済のリンクへの影響**:
- PR #74 で配置した 4 画面の learnMore はコミット時点で内部生成関数経由、
  generateURL を 1 箇所修正すれば全てが同期追従
- 本 ADR Minor Revision と同じ PR で `glossaryMapping.ts` を更新、test 期待値も更新

**「予告期間」の扱い**:
- ADR-013 初版の Update Policy（章 id 変更 1 週間等）は「既に公開・利用されている
  anchor の破壊的変更」を対象とする
- 本件は **初期合意形成中のタイポ修正** に相当し、予告期間は不要
- 両 repo とも実利用開始前のため、初期固定化として処理

### 2. Terminology Ownership（用語の責任分界）

用語定義の **master** は **machining-fundamentals**。

| 情報 | master | Matlens 側の扱い |
|---|---|---|
| 用語の定義文（ja / en） | machining-fundamentals | 参照のみ、独自書き換え禁止 |
| 用語の symbol / unit | machining-fundamentals | 参照のみ |
| 用語 ID（termId） | machining-fundamentals | Matlens は `glossaryMapping.ts` で参照 |
| 用語の **実装挙動**（Matlens の計算式） | Matlens | machining-fundamentals は引用のみ |
| 画面ルート | Matlens | machining-fundamentals は参照のみ |

言い換えると:
- **Glossary（用語定義）は learning 側が master**
- **Implementation（計算式・UI）は Matlens 側が master**
- 片方を変えると他方が追従する関係にする（後述 Update Policy）

### 3. Update Policy（破壊的変更の予告）

いずれかの変更が必要な場合、**両 repo に同時に issue を立てる**:

| 変更 | 影響 | 予告期間 |
|---|---|---|
| machining-fundamentals の章 id を変更 | Matlens の `glossaryMapping.ts` の全参照が壊れる | **1 週間以上の事前 issue** |
| machining-fundamentals の term-id を変更 | 該当リンクが壊れる | **3 日以上の事前 issue** |
| Matlens の画面ルートを変更 | machining-fundamentals の章末カードが壊れる | **1 週間以上の事前 issue** |
| 新規用語追加（双方向の拡張） | dead link なし | **予告不要、事後通知のみ** |
| pending anchor の解除 | dead link が生きる | **予告不要、即時反映歓迎** |

**共通ルール**:
- 破壊的変更 PR の本文に「相手 repo に issue #N を同時投下済」を明記
- 相手側が対応 PR を merge するまで、**本体 PR は merge しない**
- 緊急 hotfix（セキュリティ等）は事後 1 日以内に通知

### 4. Dead Link チェック

Matlens 側は CI で以下のチェックを走らせる（Phase 1 以降の拡張として実装）:

```yaml
# .github/workflows/machining-fundamentals-links.yml（将来の実装）
- name: Verify machining-fundamentals anchors
  run: |
    node scripts/verify-learn-more-links.mjs \
      --base $MACHINING_FUNDAMENTALS_BASE_URL \
      --skip-pending
```

- `glossaryMapping.ts` の全 URL を HEAD リクエストで存在確認
- `pending: true` の用語は skip
- 404 / ネットワークエラー時は **warning で PR に通知**（fail はさせない）
- 週次定期実行で dead link を検知

### 5. Out of Scope（お互い触らない領域）

machining-fundamentals に **絶対に入れない** もの:

- Matlens の顧客情報・案件番号・実名（ADR-012 の「固有名詞排除」に従う）
- Matlens の業務フロー固有の画面構成
- ISO / ASTM / JIS / AMS の全文テキスト（著作権）
- 実案件の試験データ・損傷画像

Matlens に **絶対に入れない** もの:

- machining-fundamentals の章本文（冗長化とメンテ爆発の回避）
- 学習者向けの過度な丁寧さ（PAGE_GUIDES の短さを維持、詳細は learnMore で外出し）

---

## 代替案と棄却理由

| 案 | 棄却理由 |
|---|---|
| **ADR-012 に全て記述** | 戦略と運用規約が混在すると、運用中に戦略文書を触る頻度が増えて履歴が荒れる |
| **両 repo に独立の CONTRACT.md** | 1 箇所で両者の契約を俯瞰できる方が monorepo 統合時の移行が楽 |
| **URL 規約を外部ファイル化** | URL はコードで参照するため、型付きで import できる場所（`glossaryMapping.ts`）が正解 |
| **破壊的変更の予告期間なし** | 両 repo を並行開発する体制で、予告なしの破壊的変更は信頼を壊す。予告期間を設けて PR ベースで同期する形が安全 |

---

## 影響

### ポジティブ
- 破壊的変更の予告が標準化され、両 repo の開発が事故なく進む
- 用語の master が learning 側に固定されることで、Matlens は常に最新の定義を参照できる
- dead link チェックが CI に入ることで、実際の訪問者が 404 を踏む事故が防げる
- monorepo 統合時にも本 ADR の契約がそのまま引き継げる（場所が変わるだけ）

### ネガティブ
- 両 repo で同時 issue を立てる運用が、小さな変更でもオーバーヘッドになる
  → 「破壊的変更」の定義を明確化（上の表）して運用の負担を抑える
- pending フラグの管理を忘れると dead link が量産されるリスク
  → CI で pending 解除漏れを週次チェック

### リスクと緩和策

| リスク | 緩和策 |
|---|---|
| machining-fundamentals 側の URL 規約が 1 人のコミットで変わる | 本 ADR を peer 側にも配置（monorepo 化後は共通 ADR として）、破壊的変更 PR には両 repo の同意を必須化 |
| Part A の pending が延々と解除されない | pending 解除を peer 側の章公開 PR に含めるよう運用化 |
| Matlens の画面ルート変更が machining-fundamentals に通知されない | ADR-007 の連動更新チェックリストに「machining-fundamentals への影響」欄を追加 |

---

## 実装チェックリスト

### Phase 1（本 PR 周辺で実装済 / 実装予定）
- [x] `src/data/glossaryMapping.ts` で URL 規約を型付きで実装（PR #74）
- [x] `pending: true` フラグで未実装 anchor を識別（PR #74）
- [x] 4 画面の PAGE_GUIDES に learnMore を配置（PR #74）
- [ ] UI 側の「詳しく学ぶ」ボタン実装（別 PR）
- [ ] CI の dead link チェック（Phase 1 後半）
- [ ] ADR-007 の連動更新チェックリストに「machining-fundamentals 影響」欄を追加

### Phase 2（peer 側との協業）
- [ ] peer 側にも本 ADR のコピー配置、または `integration-points.md` に要点抽出
- [ ] 章末「Matlens で実例」カードの実装
- [ ] 用語 master のメンテナンスルールを peer 側で明文化

---

## 関連

- ADR-012（親密化統合戦略 — 戦略レベル）
- ADR-007（PAGE_GUIDES / announcements / README の連動更新ルール）
- PR #74（Phase 1 実装: glossaryMapping.ts + PAGE_GUIDES 型拡張）
- peer yilmogxd からの URL 規約提案（2026-04-22 受領、2026-04-23 合意）
