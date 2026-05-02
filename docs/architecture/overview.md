# Matlens アーキテクチャ俯瞰

> MaiML を中核に据えた Matlens の概念マップ。データの入出力・探索・解析・工程の 4 衛星が MaiML Studio を中心に連携します。

## 1 枚絵: MaiML 中核モデル

```mermaid
flowchart TD
  subgraph Core["コア (Core)"]
    direction TB
    Studio["📦 MaiML Studio<br/>JIS K 0200:2024<br/>Import / Export / Inspect / Validate / Diff"]
  end

  subgraph Data["データ (Data)"]
    direction TB
    Materials["材料"]
    Specimens["試験片"]
    Tests["試験 + マトリクス"]
    Projects["案件"]
    Reports["レポート"]
    Damage["損傷ギャラリー"]
  end

  subgraph Explore["探索 (Explore)"]
    direction TB
    Search["検索（統合）<br/>Semantic / RAG / Similar / Cross"]
    Visualize["可視化（統合）<br/>Timeline / Overlay / Crystal / Multiscale"]
    Experiment["加工実験"]
  end

  subgraph Analyze["解析 (Analyze)"]
    direction TB
    Bayes["ベイズ最適化<br/>1D/2D GP"]
    Sim["経験式<br/>Hall-Petch / LM / JMAK / ROM"]
    Cutting["切削条件<br/>エクスプローラ"]
    Tool["工具ライフ<br/>Taylor 寿命"]
  end

  subgraph Workflow["工程 (Workflow)"]
    Petri["ペトリネット<br/>P/T net + PNML"]
  end

  Studio -. round-trip .-> Materials
  Studio -. round-trip .-> Tests
  Studio -. round-trip .-> Projects
  Studio -. round-trip .-> Damage

  Data --> Explore
  Data --> Analyze
  Data --> Workflow

  Explore -. provenance .-> Studio
  Analyze -. provenance .-> Studio
  Workflow -. provenance .-> Studio

  classDef core fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#0b1220;
  classDef data fill:#fef3c7,stroke:#d97706,color:#0b1220;
  classDef explore fill:#dcfce7,stroke:#22c55e,color:#0b1220;
  classDef analyze fill:#ede9fe,stroke:#7c3aed,color:#0b1220;
  classDef workflow fill:#fce7f3,stroke:#db2777,color:#0b1220;
  class Studio core;
  class Materials,Specimens,Tests,Projects,Reports,Damage data;
  class Search,Visualize,Experiment explore;
  class Bayes,Sim,Cutting,Tool analyze;
  class Petri workflow;
```

## 構成原則

### 1. MaiML がアプリの存在理由
- **MaiML (JIS K 0200:2024)** はラボ計測器・LIMS・OEM との相互運用フォーマット
- Materials / Tests / Projects / Damage はすべて MaiML として round-trip 可能
- Provenance（出所）と Uncertainty（不確かさ）は MaiML 必須項目として全データに紐付く

### 2. レイヤード分離（ADR-0001）
```
src/
├── domain/        ドメイン型 + Zod スキーマ + 定数（外部依存なし）
├── infra/         api / mappers / repositories（純 TS）
├── mocks/         seeds + generators + MSW handler
├── app/providers/ RepositoryProvider + QueryProvider
└── features/      機能単位モジュール
    ├── maiml/     コア要素
    ├── projects/  案件
    ├── tests/     試験 + マトリクス
    ├── damage/    損傷
    ├── cutting/   切削プロセス
    ├── tools/     工具ライフ
    ├── dashboard/ KPI ダッシュボード
    ├── explore/   検索 / 可視化 統合ハブ
    └── search/    旧横断検索（PoC）
```

### 3. Framework-Agnostic 境界
将来 Vue/Nuxt 等への移植可能性を保つため、以下は **React 非依存**:
- `domain/types/`, `domain/schemas/`, `domain/constants/`
- `infra/repositories/interfaces/` および `mock/` 実装
- `services/maiml.ts`, `services/maimlProject.ts`（純 TS シリアライザ）
- `services/bayesianOpt.ts`, `services/empiricalFormulas.ts`
- `features/cutting/utils/`（FFT / Taylor / Stability Lobe / Kc 切削抵抗）
- `features/damage/similarity.ts`
- `features/dashboard/utils/opsMetrics.ts`
- `design-tokens/`（CSS variables + Tailwind tokens）

詳細は [リプレイス計画 #107](https://github.com/BoxPistols/Matlens/issues/107) と [Phase 0 抽出 #108](https://github.com/BoxPistols/Matlens/issues/108) を参照。

## 関連 ADR
- ADR-0001: レイヤードアーキテクチャ
- ADR-0004: MaiML を主要出力フォーマットとする
- ADR-0006: ペトリネット可視化（純 SVG 自作）
- ADR-0007: 連動更新ルール（announcements / README / PAGE_GUIDES）
- ADR-0015: 機密化と命名ポリシー
- ADR-0016: MaiML をコア要素として位置付ける（本 IA リファクタの根拠）
