# 業務フロー叩き台図

現場ヒアリング（2026-05-18 ~）で「想定フローを示して差分を聞く」ための叩き台。
Mermaid テキストで管理し、GitHub レンダリング・SVG export・Figma 取込のいずれにも回せるようにする。

## 使い方

1. キックオフでこれらを画面投影し、「**当社の業務、ここ違いますか？**」と聞く
2. 違いをその場で書き換える（テキストなので git diff に残せる）
3. ヒアリング後、確定フローは ADR or `docs/research/` に昇格させる

## 想定外しの可能性

このフロー図はすべて [`personas-workflows.md`](../personas-workflows.md) の仮説ベース。
**外して当然**。1〜2 回の対話で書き換えること。

## ファイル一覧

| ファイル | 内容 | 主なペルソナ |
|---|---|---|
| [01-experiment-lifecycle.mmd](./01-experiment-lifecycle.mmd) | 試験案件のライフサイクル（受託 → レポート提出） | PM + 研究員 + 技師 |
| [02-rework-loop.mmd](./02-rework-loop.mmd) | 異常所見 → 再試験ループ（Petri net 想定） | 研究員 + 技師 |
| [03-discard-decision.mmd](./03-discard-decision.mmd) | 試験片の廃棄判定（保管延長 / 廃棄） | 技師 + PM |
| [04-excel-to-web-journey.mmd](./04-excel-to-web-journey.mmd) | Excel ベース → Matlens への段階的移行 UX | 全員（特に研究員） |
| [05-maiml-export.mmd](./05-maiml-export.mmd) | MaiML エクスポート → 外部 OEM 提出 | PM + 研究員 |

## SVG export

```sh
# 全 mmd を SVG に変換（要 @mermaid-js/mermaid-cli）
pnpm dlx @mermaid-js/mermaid-cli -i docs/onsite/flows/01-experiment-lifecycle.mmd -o docs/onsite/flows/01-experiment-lifecycle.svg
# まとめて
for f in docs/onsite/flows/*.mmd; do pnpm dlx @mermaid-js/mermaid-cli -i "$f" -o "${f%.mmd}.svg"; done
```

SVG ができれば Figma / FigJam にドラッグ&ドロップで取り込める（画像扱い、native オブジェクト化は別工程）。
