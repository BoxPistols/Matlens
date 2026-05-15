// docs/onsite/flows/*.mmd を SVG に一括書き出すラッパー。
//
// mermaid-cli は内部で puppeteer + Chromium を必要とするが、CI 用の
// chrome-headless-shell ダウンロードを避けるため、macOS のシステム Chrome を
// 使う puppeteer config を一時生成して渡す。Linux/Win 用も同等の場所を試す。
import { readdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const FLOWS_DIR = 'docs/onsite/flows';

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  process.env.PUPPETEER_EXECUTABLE_PATH,
].filter(Boolean);

function findChrome() {
  return CHROME_CANDIDATES.find((p) => existsSync(p));
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit' });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.error('No system Chrome found. Set PUPPETEER_EXECUTABLE_PATH or install Chrome.');
    process.exit(1);
  }
  const cfgPath = join(tmpdir(), `matlens-mmdc-${Date.now()}.json`);
  await writeFile(cfgPath, JSON.stringify({ executablePath: chrome }, null, 2));
  console.log(`[flows:svg] using chrome at ${chrome}`);

  const entries = await readdir(FLOWS_DIR);
  const mmds = entries.filter((f) => f.endsWith('.mmd')).sort();
  if (mmds.length === 0) {
    console.log('[flows:svg] no .mmd files found');
    return;
  }
  for (const f of mmds) {
    const inPath = join(FLOWS_DIR, f);
    const outPath = join(FLOWS_DIR, f.replace(/\.mmd$/, '.svg'));
    console.log(`[flows:svg] ${f} -> ${outPath}`);
    await run('pnpm', [
      'dlx',
      '@mermaid-js/mermaid-cli@latest',
      '-i',
      inPath,
      '-o',
      outPath,
      '-b',
      'transparent',
      '-p',
      cfgPath,
    ]);
  }
  console.log('[flows:svg] done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
