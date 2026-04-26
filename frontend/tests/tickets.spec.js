// tickets.spec.js  –  Incident ticket form E2E tests
// Route: /tickets/new (protected)

const { test, expect } = require('@playwright/test');

let testUserEmail = null;

async function loginAs(page) {
  if (!testUserEmail) {
    testUserEmail = 'playwright_tick_' + Date.now() + '@test.com';
    await page.request.post('http://localhost:8080/api/auth/register', {
      data: { name: 'Test User', email: testUserEmail, password: 'password123' }
    });
  }

  await page.goto('/login');
  await page.locator('input[type="email"], input[name="email"]').first().fill(testUserEmail);
  await page.locator('input[type="password"], input[name="password"]').first().fill('password123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 12000 });
}

test.describe('Support Tickets – Create Ticket Form', () => {

  test('unauthenticated visit to /tickets/new redirects to /login', async ({ page }) => {
    await page.goto('/tickets/new');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('create ticket page loads with a heading', async ({ page }) => {
    await loginAs(page);
    await page.goto('/tickets/new');
    await expect(page).toHaveURL(/\/tickets\/new/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('ticket form has required input fields', async ({ page }) => {
    await loginAs(page);
    await page.goto('/tickets/new');
    
    // Check for title input
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toBeVisible({ timeout: 10000 });

    // Check for category select
    const categorySelect = page.locator('select[name="category"]');
    await expect(categorySelect).toBeVisible();

    // Check for description textarea
    const descInput = page.locator('textarea[name="description"]');
    await expect(descInput).toBeVisible();

    // Check for priority select
    const prioritySelect = page.locator('select[name="priority"]');
    await expect(prioritySelect).toBeVisible();
  });

  test('ticket form has location or resourceId field', async ({ page }) => {
    await loginAs(page);
    await page.goto('/tickets/new');

    const locationInput = page.locator('input[name="location"], input[name="resourceId"]');
    await expect(locationInput.first()).toBeVisible({ timeout: 10000 });
  });

  test('ticket form has a submit button', async ({ page }) => {
    await loginAs(page);
    await page.goto('/tickets/new');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible({ timeout: 10000 });
  });

});
