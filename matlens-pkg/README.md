# Matlens — 研究・実験データ管理システム

> 材料研究者・実験担当者向けのデータ管理 Web アプリ  
> React 18 + TypeScript + AI ベクトル検索 + RAG チャット

---

## クイックスタート（30秒）

### macOS / Linux

```bash
bash start.sh
```

### Windows

`start.bat` をダブルクリック  
または PowerShell / コマンドプロンプトで:
```
start.bat
```

### macOS（ダブルクリック）

`Matlens.command` をダブルクリックすると Terminal が開いて自動起動します。  
※ 初回のみ: 右クリック →「開く」→「開く」で許可が必要な場合があります。

---

## 動作要件

以下のいずれか **1つ** がインストールされていれば動作します:

| ランタイム | バージョン | ダウンロード |
|-----------|-----------|------------|
| **Python 3** ⭐ 推奨 | 3.6 以上 | https://python.org |
| Node.js | 14 以上 | https://nodejs.org |
| Ruby | 2.0 以上 | https://ruby-lang.org |
| PHP | 7.0 以上 | https://php.net |

> **なぜローカルサーバーが必要か？**  
> ブラウザのセキュリティポリシーにより、`file://` で直接開くと  
> CDN スクリプト（React, Chart.js 等）が読み込めません。  
> `http://localhost` 経由であれば全機能が正常に動作します。

---

## ファイル構成

```
matlens/
├── index.html          ← アプリ本体（このファイルだけで完結）
├── start.sh            ← macOS / Linux / WSL 起動スクリプト
├── start.bat           ← Windows 起動スクリプト
├── Matlens.command       ← macOS ダブルクリック起動
├── scripts/
│   └── check-env.sh   ← 環境診断ツール
└── README.md           ← このファイル
```

---

## 詳細な起動手順

### Python 3（推奨）

```bash
# 方法 1: start.sh を使う（推奨）
bash start.sh

# 方法 2: 手動
cd matlens
python3 -m http.server 8080
# ブラウザで → http://localhost:8080/index.html
```

### Node.js

```bash
# start.sh が自動検出します。手動の場合:
cd matlens
npx serve . --listen 8080
# ブラウザで → http://localhost:8080/index.html
```

### VS Code（Live Server 拡張）

1. VS Code で `matlens` フォルダを開く
2. `index.html` を右クリック
3. 「Open with Live Server」を選択

---

## 環境診断

起動できない場合は診断スクリプトを実行してください:

```bash
bash scripts/check-env.sh
```

出力例:
```
Matlens 環境診断レポート
==============================
▶ サーバーランタイム
  ✓ Python 3: Python 3.12.0
  ✗ Node.js: 見つかりません
▶ ブラウザ
  ✓ macOS open: available
▶ ネットワーク
  ✓ インターネット接続: CDNにアクセス可能
▶ ポート
  ✓ ポート 8080: 利用可能
▶ index.html
  ✓ index.html: 221 KB

スコア: 3 / 5
✓ 起動可能です。bash start.sh を実行してください。
```

---

## よくある質問

**Q: ブラウザが自動で開かない**  
A: `http://localhost:8080/index.html` を手動でブラウザのアドレスバーに入力してください。

**Q: ポート 8080 が使用中と言われる**  
A: `start.sh` が自動で代替ポート（8081, 8082...）を選択します。  
表示されるURLを確認してください。

**Q: Ctrl+C で止めたのにポートが残っている**  
```bash
# macOS / Linux: PIDを確認して強制終了
lsof -i :8080
kill -9 <PID>
```

**Q: AI 機能が「デモモード」と表示される**  
A: AI 回答を有効にするには API キーが必要です。アプリ右下の設定ボタン（AI設定）から入力してください:
- OpenAI API キー: https://platform.openai.com/api-keys
- Gemini API キー: https://aistudio.google.com/app/apikey

**Q: macOS で `Matlens.command` が開けない**  
A: セキュリティ設定により実行がブロックされる場合があります:
```bash
chmod +x Matlens.command
xattr -d com.apple.quarantine Matlens.command  # 隔離属性を削除
```
または: 右クリック →「開く」→「開く」

---

## AI 機能の設定

右下の **AI設定ボタン** から設定できます:

| 設定 | 説明 |
|------|------|
| **招待コード** | `MATLENS2026` を入力すると 30回/日に増量 |
| **OpenAI API キー** | `sk-...` を入力すると無制限・GPT-4.1-mini が有効 |
| **Gemini API キー** | `AIza...` を入力すると無制限 |

> ⚠️ API キーはブラウザの `localStorage` に保存されます。  
> 共用 PC では使用後に「キーを削除」してください。

---

## 技術スタック

| 分類 | 技術 |
|------|------|
| UI フレームワーク | React 18 (Babel CDN) |
| スタイリング | Tailwind CSS CDN + CSS Variables (4テーマ) |
| グラフ | Chart.js 4 |
| AI | OpenAI GPT-4.1 nano/mini, Gemini 2.5 Flash |
| ベクトル検索 | TF.js Universal Sentence Encoder (ブラウザ内) |
| Markdown | marked.js |
| 音声 | Web Speech API (ブラウザ標準) |
| 状態管理 | React Context + useReducer |
| アーキテクチャ | Atomic Design (Atoms/Molecules/Organisms/Pages) |

---

## ライセンス

MIT License — 自由に使用・改変・配布できます。
