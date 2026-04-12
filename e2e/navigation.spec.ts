import { test, expect } from '@playwright/test';

test.describe('基本ナビゲーション', () => {
  test('トップページ（ダッシュボード）が表示される', async ({ page }) => {
    await page.goto('/');
    // デフォルトハッシュは #/dash（ダッシュボード）
    await expect(page.locator('main')).toBeVisible();
    // サイドバーのダッシュボードが aria-current="page"
    await expect(page.locator('button[aria-current="page"]')).toBeVisible();
  });

  test('サイドバーから材料一覧に遷移できる', async ({ page }) => {
    await page.goto('/');
    // 材料データ一覧のサイドバーボタンをクリック
    await page.locator('nav[aria-label="メインナビゲーション"] button', { hasText: '材料データ一覧' }).click();
    await expect(page).toHaveURL(/#\/list/);
    // 一覧ページのヘッダーが表示される
    await expect(page.locator('main')).toContainText('材料データ一覧');
  });

  test('サイドバーから新規登録に遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav[aria-label="メインナビゲーション"] button', { hasText: '新規登録' }).click();
    await expect(page).toHaveURL(/#\/new/);
    await expect(page.locator('main')).toContainText('新規登録');
  });

  test('サイドバーからヘルプに遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav[aria-label="メインナビゲーション"] button', { hasText: 'ヘルプ' }).click();
    await expect(page).toHaveURL(/#\/help/);
  });

  test('言語切替 (JP→EN) でサイドバーラベルが英語になる', async ({ page }) => {
    await page.goto('/');
    // Topbar の言語切替ボタン (EN) をクリック
    const langGroup = page.locator('[role="group"][aria-label="言語切替"]');
    await langGroup.locator('button', { hasText: 'EN' }).click();
    // サイドバーに英語ラベルが表示される
    await expect(page.locator('nav[aria-label="メインナビゲーション"]')).toContainText('Material List');
    await expect(page.locator('nav[aria-label="メインナビゲーション"]')).toContainText('New Entry');
    await expect(page.locator('nav[aria-label="メインナビゲーション"]')).toContainText('Help / Glossary');
  });
});
