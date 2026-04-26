// notifications.spec.js  –  Notifications panel/page E2E tests
// Route: /notifications (protected)

const { test, expect } = require('@playwright/test');

let testUserEmail = null;

async function loginAs(page) {
  if (!testUserEmail) {
    testUserEmail = 'playwright_notif_' + Date.now() + '@test.com';
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

test.describe('Notifications – Notification Page', () => {

  test('unauthenticated visit to /notifications redirects to /login', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('notifications page loads correctly after login', async ({ page }) => {
    await loginAs(page);
    await page.goto('/notifications');
    await expect(page).toHaveURL(/\/notifications/);
    
    // There should be a visible heading or notification center title
    await expect(page.locator('h1, h2, [class*="title"], [class*="heading"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('notifications list or panel is visible', async ({ page }) => {
    await loginAs(page);
    await page.goto('/notifications');

    // Either a list of notifications or an "empty" state should be visible
    const listOrEmptyState = page.locator('[class*="notification"], [class*="empty"], [class*="list"], [class*="card"]');
    await expect(listOrEmptyState.first()).toBeVisible({ timeout: 10000 });
  });

});
