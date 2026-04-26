// resources.spec.js  –  Campus Resources page E2E tests
// Route: /resources  (protected – requires login first)

const { test, expect } = require('@playwright/test');

let testUserEmail = null;

// Helper: log in and store session state in the browser context
async function loginAs(page) {
  if (!testUserEmail) {
    testUserEmail = 'playwright_res_' + Date.now() + '@test.com';
    await page.request.post('http://localhost:8080/api/auth/register', {
      data: { name: 'Test User', email: testUserEmail, password: 'password123' }
    });
  }

  await page.goto('/login');
  await page.locator('input[type="email"], input[name="email"]').first().fill(testUserEmail);
  await page.locator('input[type="password"], input[name="password"]').first().fill('password123');
  await page.locator('button[type="submit"]').click();
  // Wait until we are redirected away from /login
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 12000 });
}

test.describe('Resources – Campus Resources Page', () => {

  test('unauthenticated visit to /resources redirects to /login', async ({ page }) => {
    await page.goto('/resources');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('resources page title / heading is visible after login', async ({ page }) => {
    await loginAs(page);
    await page.goto('/resources');
    await expect(page).toHaveURL(/\/resources/);
    // There should be a visible heading on the page
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('resources page has a search or filter input', async ({ page }) => {
    await loginAs(page);
    await page.goto('/resources');
    // Search bar or filter dropdown should exist
    const searchOrFilter = page.locator(
      'input[type="text"], input[type="search"], input[placeholder*="search" i], input[placeholder*="filter" i], select'
    );
    await expect(searchOrFilter.first()).toBeVisible({ timeout: 10000 });
  });

  test('resources list renders at least one resource card or row', async ({ page }) => {
    await loginAs(page);
    await page.goto('/resources');
    // Either a card, list item, or table row should appear
    const items = page.locator(
      '[class*="resource"], [class*="card"], [class*="item"], table tr'
    );
    await expect(items.first()).toBeVisible({ timeout: 12000 });
  });

});
