import { test, expect } from '@playwright/test';

test.describe('UI 設定', () => {
  test('テーマ切替 (Light→Dark) で data-theme 属性が変わる', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    // 初期状態を Light にリセット（localStorage をクリア）
    await page.evaluate(() => localStorage.removeItem('matlens:theme'));
    await page.reload();

    // Light テーマボタンをクリックして初期状態を確定
    const themeGroup = page.locator('[role="group"][aria-label="テーマ切替"]');
    await themeGroup.locator('button', { hasText: 'Light' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');

    // Dark テーマに切替
    await themeGroup.locator('button', { hasText: 'Dark' }).click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('密度切替 (Regular→Compact) で data-density 属性が変わる', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    // Regular をクリックして初期化
    const densityGroup = page.locator('[role="group"][aria-label="UI 密度切替"]');
    await densityGroup.locator('button:has-text("標準"), button:has-text("Regular")').first().click();
    await expect(html).toHaveAttribute('data-density', 'regular');

    // Compact に切替
    await densityGroup.locator('button:has-text("コンパクト"), button:has-text("Compact")').first().click();
    await expect(html).toHaveAttribute('data-density', 'compact');
  });

  test('言語切替 (JP→EN) で data-lang 属性が変わる', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    // JP をクリックして初期化
    const langGroup = page.locator('[role="group"][aria-label="言語切替"]');
    await langGroup.locator('button', { hasText: 'JP' }).click();
    await expect(html).toHaveAttribute('data-lang', 'ja');

    // EN に切替
    await langGroup.locator('button', { hasText: 'EN' }).click();
    await expect(html).toHaveAttribute('data-lang', 'en');
  });
});
