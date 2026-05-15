import { test, expect } from '@playwright/test';

test.describe('marketing shell', () => {
  test('home page responds', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.ok()).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
  });
});
