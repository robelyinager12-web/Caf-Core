import { test, expect, Browser } from '@playwright/test';

async function loginAs(browser: Browser, email: string, password: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  return page;
}

test.describe('Order Creation to Kitchen Display (real-time)', () => {
  test('a new order placed by a cashier appears live on the kitchen display', async ({
    browser,
  }) => {
    // Two separate browser contexts simulate two different physical
    // devices — a counter tablet and a kitchen screen — since this is
    // exactly how the Socket.IO real-time flow from Phase 7 Step 5 is
    // meant to be used in production.
    const cashierPage = await loginAs(browser, 'admin@cafeteria.local', 'Admin@12345');
    const kitchenPage = await loginAs(browser, 'admin@cafeteria.local', 'Admin@12345');

    await kitchenPage.goto('/kitchen');
    await expect(kitchenPage.getByText('Kitchen Display')).toBeVisible();

    await cashierPage.goto('/orders/new');
    await cashierPage.getByText('Cafe Latte').first().click();
    await cashierPage.getByRole('button', { name: 'Place Order' }).click();

    await expect(cashierPage.getByText(/sent to the kitchen/)).toBeVisible();

    // No reload on the kitchen page — this assertion only passes if the
    // Socket.IO 'order:created' event actually pushed the new order in,
    // which is the entire point of Phase 6 Step 6's real-time architecture.
    await expect(kitchenPage.getByText('Cafe Latte')).toBeVisible({ timeout: 5000 });

    await cashierPage.close();
    await kitchenPage.close();
  });
});