import { test, expect } from '@playwright/test';

test.describe('guest shopping', () => {
  test('homepage shows catalog and cart gate at checkout', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.ok()).toBeTruthy();

    await expect(page.locator('[data-cy="category-grid"]')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-cy="product-card"]').first()).toBeVisible();

    await page.locator('[data-cy="add-to-cart-btn"]').first().click();
    await expect(page.locator('[data-cy="cart-bar"]')).toBeVisible();
    await expect(page.locator('[data-cy="cart-item-count"]')).toContainText('1');

    await page.locator('[data-cy="checkout-btn"]').click();
    await expect(page).toHaveURL(/login/);
  });
});
