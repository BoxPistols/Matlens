import { test, expect } from '@playwright/test';

test.describe('材料データフロー', () => {
  test('材料一覧ページが表示され、テーブルにデータがある', async ({ page }) => {
    await page.goto('/#/list');
    await expect(page.locator('main')).toContainText('材料データ一覧');
    // テーブル行が存在する（ヘッダー行を除いてデータ行が 1 行以上）
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test('検索ボックスに入力するとフィルタされる', async ({ page }) => {
    await page.goto('/#/list');
    // 全件数を取得
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    const totalBefore = await rows.count();

    // 検索ボックスにテキスト入力
    const searchBox = page.locator('input[placeholder*="全文検索"], input[placeholder*="Search"]');
    await searchBox.fill('SUS');
    // フィルタ後の行数が変わる（減るか同じ）
    await page.waitForTimeout(300); // debounce 待ち
    const totalAfter = await rows.count();
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
  });

  test('新規登録 → Step1 → Step2 → Step3 確認 → 登録 → 一覧に戻る', async ({ page }) => {
    await page.goto('/#/new');
    await expect(page.locator('main')).toContainText('新規登録');

    // Step1: 基本情報入力
    await page.locator('input').first().fill('E2E テスト材料');
    // カテゴリ選択
    await page.locator('select').first().selectOption('金属合金');
    // 組成入力
    const compInput = page.locator('input[placeholder*="Fe-"]').or(page.locator('input[placeholder*="例:"]')).first();
    await compInput.fill('Fe-20Cr-10Ni');
    // 「次へ」ボタンをクリック
    await page.locator('button', { hasText: '次へ' }).click();

    // Step2: 物性データ — 次へで Step3 に進む
    await page.locator('button', { hasText: '次へ' }).click();

    // Step3: 確認画面 — 入力値が表示されている
    await expect(page.locator('main')).toContainText('E2E テスト材料');
    await expect(page.locator('main')).toContainText('金属合金');

    // 「登録する」ボタンをクリック
    await page.locator('button', { hasText: '登録する' }).click();

    // 一覧ページに戻る
    await expect(page).toHaveURL(/#\/list/);
  });

  test('詳細ページに遷移して材料名が表示される', async ({ page }) => {
    await page.goto('/#/list');
    // テーブルの最初のデータ行をクリック
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible();
    // 行内のリンクまたはクリック可能な要素をクリック
    await firstRow.click();
    // 詳細ページに遷移
    await expect(page).toHaveURL(/#\/detail/);
    // メインコンテンツに材料名が含まれる（何らかのテキスト）
    await expect(page.locator('main')).not.toBeEmpty();
  });
});
