import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows an error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@cafeteria.local');
    await page.getByLabel('Password').fill('WrongPassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('logs in successfully and reaches the dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@cafeteria.local');
    await page.getByLabel('Password').fill('Admin@12345');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Today's Overview")).toBeVisible();
  });

  test('persists login across a page reload', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@cafeteria.local');
    await page.getByLabel('Password').fill('Admin@12345');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});