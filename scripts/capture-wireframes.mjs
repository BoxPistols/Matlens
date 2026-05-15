// 主要画面のラフワイヤー生成スクリプト。
//
// dev server を起動して各 hash route にアクセスし、フルページ screenshot を
// docs/onsite/wireframes/captures/ に保存する。現場ヒアリングで「画面を見せる」
// 用途で Figma / FigJam に取り込むため、PNG + 1440x900 viewport 固定で書き出す。
//
// 使い方:
//   pnpm capture:wireframes
//
// 前提: pnpm install 済 + Playwright Chromium 済 (pnpm exec playwright install chromium)
//
// 重い処理（dev server 起動 + 28 ページの networkidle 待ち）なので、commit には
// 含めず必要なときだけ手で走らせる想定。
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { setTimeout as wait } from 'node:timers/promises';

const PORT = 5173;
const BASE = `http://localhost:${PORT}`;
const OUT_DIR = 'docs/onsite/wireframes/captures';

// 持参資料として優先度の高い画面に絞る（28 画面全部撮ると重いので、
// kickoff の 5/18 で確実に見せたい順）。
const ROUTES = [
  { id: 'dash', label: '01-ダッシュボード' },
  { id: 'list', label: '02-材料データ一覧' },
  { id: 'detail', label: '03-材料データ詳細', detailId: 'M-001' },
  { id: 'new', label: '04-新規登録フォーム' },
  { id: 'vsearch', label: '05-横断ベクトル検索' },
  { id: 'rag', label: '06-RAG チャット' },
  { id: 'sim', label: '07-類似事例検索' },
  { id: 'matrix', label: '08-試験マトリクス' },
  { id: 'specimens', label: '09-試験片トラッカー' },
  { id: 'ops-dash', label: '10-運用ダッシュボード' },
  { id: 'mat-master', label: '11-材料マスタ' },
  { id: 'std-master', label: '12-規格マスタ' },
  { id: 'reports', label: '13-レポート一覧' },
  { id: 'tools', label: '14-工具ライフトラッカー' },
  { id: 'cutting-conditions', label: '15-切削条件エクスプローラ' },
  { id: 'petri', label: '16-Petri net 可視化' },
  { id: 'bayes', label: '17-ベイズ最適化' },
  { id: 'simulate', label: '18-経験式シミュレーション' },
  { id: 'experiment', label: '19-実験ダッシュボード' },
  { id: 'help', label: '20-ヘルプ用語集' },
];

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not yet
    }
    await wait(500);
  }
  throw new Error(`dev server did not respond at ${url} within ${timeoutMs}ms`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log(`[capture] starting dev server on :${PORT}`);
  const dev = spawn('pnpm', ['dev', '--port', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BROWSER: 'none' },
  });
  dev.stdout?.on('data', (b) => process.stdout.write(`[dev] ${b}`));
  dev.stderr?.on('data', (b) => process.stderr.write(`[dev] ${b}`));

  try {
    await waitForServer(BASE);
    console.log('[capture] dev server ready');

    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    for (const r of ROUTES) {
      const route = r.detailId ? `${r.id}_${r.detailId}` : r.id;
      const url = `${BASE}/#/${route}`;
      console.log(`[capture] -> ${r.label}  (${url})`);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
        await wait(800); // SPA の遅延描画ぶん
        await page.screenshot({
          path: `${OUT_DIR}/${r.label}.png`,
          fullPage: true,
        });
      } catch (err) {
        console.error(`[capture]   FAILED: ${err.message}`);
      }
    }

    await browser.close();
    console.log(`[capture] done. output: ${OUT_DIR}`);
  } finally {
    dev.kill('SIGTERM');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
