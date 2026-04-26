// auth.spec.js  –  Login page E2E tests
// Flow: Login page loads correctly + protected routes redirect unauthenticated users

const { test, expect } = require('@playwright/test');

test.describe('Authentication – Login Page', () => {

  test('login page loads with correct heading', async ({ page }) => {
    await page.goto('/login');
    // The page should not redirect away – it is public
    await expect(page).toHaveURL(/\/login/);
    // Heading or brand text must be visible
    await expect(page.locator('h1, h2, [class*="brand"], [class*="title"]').first()).toBeVisible();
  });

  test('login form has email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });

  test('login form has a submit button', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });

  test('shows error on bad credentials', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"], input[name="email"]').first().fill('notauser@test.com');
    await page.locator('input[type="password"], input[name="password"]').first().fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    
    // An error message should appear somewhere on the page
    await expect(page.getByText(/invalid|fail|error|unauthorized/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('protected route /dashboard redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    // React Router's ProtectedRoute should push to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('protected route /tickets redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/tickets');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('protected route /bookings redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/bookings');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('protected route /notifications redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('register page is accessible and has a form', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('form').first()).toBeVisible();
  });

});
