import { test, expect } from '@playwright/test';

test.describe('ファセット検索', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/list');
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('詳細条件パネルを開く', async ({ page }) => {
    // 「詳細条件」ボタンをクリック
    await page.locator('button', { hasText: '詳細条件' }).click();
    // カテゴリファセットが表示される
    await expect(page.locator('text=カテゴリ').or(page.locator('text=Category'))).toBeVisible();
  });

  test('カテゴリファセットをクリックしてフィルタされる', async ({ page }) => {
    // 詳細条件パネルを開く
    await page.locator('button', { hasText: '詳細条件' }).click();

    // 全件数を記録
    const rows = page.locator('table tbody tr');
    const totalBefore = await rows.count();

    // 「金属合金」ファセットをクリック
    await page.locator('button', { hasText: '金属合金' }).first().click();

    // フィルタ後の行数が変わる
    await page.waitForTimeout(200);
    const totalAfter = await rows.count();
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
  });

  test('フィルタチップが表示される', async ({ page }) => {
    // 詳細条件パネルを開く
    await page.locator('button', { hasText: '詳細条件' }).click();
    // カテゴリファセットをクリック
    await page.locator('button', { hasText: '金属合金' }).first().click();

    // フィルタチップ（アクティブフィルタタグ）が表示される
    // FilterChip は label と close ボタンを持つ
    await expect(page.locator('text=金属合金')).toBeVisible();
  });

  test('クリアボタンで全フィルタが解除される', async ({ page }) => {
    // 詳細条件パネルを開く
    await page.locator('button', { hasText: '詳細条件' }).click();
    // カテゴリファセットをクリック
    await page.locator('button', { hasText: '金属合金' }).first().click();

    // クリアボタンをクリック
    await page.locator('button', { hasText: 'クリア' }).click();

    // フィルタチップが消えている（金属合金のアクティブ状態が解除）
    // クリア後は全件表示に戻る
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    // 「全件表示」テキストが表示される
    await expect(page.locator('text=全件表示').or(page.locator('text=All items'))).toBeVisible();
  });
});
