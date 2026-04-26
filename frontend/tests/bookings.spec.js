// bookings.spec.js  –  Booking request form E2E tests
// Route: /bookings  (protected – regular USER role)

const { test, expect } = require('@playwright/test');

let testUserEmail = null;

async function loginAs(page) {
  if (!testUserEmail) {
    testUserEmail = 'playwright_book_' + Date.now() + '@test.com';
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

test.describe('Bookings – Booking Request Form', () => {

  test('unauthenticated visit to /bookings redirects to /login', async ({ page }) => {
    await page.goto('/bookings');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('bookings page loads with a heading', async ({ page }) => {
    await loginAs(page);
    await page.goto('/bookings');
    await expect(page).toHaveURL(/\/bookings/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('booking form has a resource / room selector', async ({ page }) => {
    await loginAs(page);
    await page.goto('/bookings');
    // The booking form contains a resource dropdown
    const resourceSelect = page.locator('select[name="resourceId"]');
    await expect(resourceSelect).toBeVisible({ timeout: 10000 });
  });

  test('booking form has a date field', async ({ page }) => {
    await loginAs(page);
    await page.goto('/bookings');
    const dateInput = page.locator('input[type="date"], input[name="date"]');
    await expect(dateInput.first()).toBeVisible({ timeout: 10000 });
  });

  test('booking form has start time and end time fields', async ({ page }) => {
    await loginAs(page);
    await page.goto('/bookings');
    const timeInputs = page.locator('input[type="time"]');
    // Should have at least 2 time inputs (start + end)
    await expect(timeInputs).toHaveCount(2, { timeout: 10000 });
  });

  test('booking form has a purpose / description field', async ({ page }) => {
    await loginAs(page);
    await page.goto('/bookings');
    const purposeField = page.locator('textarea[name="purpose"], input[name="purpose"]');
    await expect(purposeField).toBeVisible({ timeout: 10000 });
  });

  test('booking form has an expected attendees field', async ({ page }) => {
    await loginAs(page);
    await page.goto('/bookings');
    const attendeesInput = page.locator('input[name="expectedAttendees"], input[type="number"]');
    await expect(attendeesInput.first()).toBeVisible({ timeout: 10000 });
  });

  test('booking form has a submit button', async ({ page }) => {
    await loginAs(page);
    await page.goto('/bookings');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible({ timeout: 10000 });
  });

  test('bookings table / list section is visible', async ({ page }) => {
    await loginAs(page, process.env.TEST_USER_EMAIL || 'student@gmail.com',
                        process.env.TEST_USER_PASS  || 'password123');
    await page.goto('/bookings');
    // A table or booking list must be present
    const listOrTable = page.locator('table, [class*="table"], [class*="list"], [class*="card"]');
    await expect(listOrTable.first()).toBeVisible({ timeout: 12000 });
  });

});
