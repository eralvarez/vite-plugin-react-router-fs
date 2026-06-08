import { test, expect } from '@playwright/test';

/**
 * Guard behaviour tests.
 *
 * Validates:
 * - Dashboard guard redirects to /login when not authenticated
 * - Dashboard guard passes when ?auth=true is present
 * - Admin guard redirects to /unauthorized when ?role=admin is absent
 * - Admin guard passes when ?role=admin is present
 * - Guards compose: both root and section guards apply
 */

test.describe('Dashboard guard', () => {
  test('redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Guard should redirect away from /dashboard
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('page-login')).toBeVisible();
  });

  test('redirects to /login from /dashboard/profile when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('page-login')).toBeVisible();
  });

  test('redirects to /login from /dashboard/settings when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('page-login')).toBeVisible();
  });

  test('redirects to /login from deeply nested /dashboard/settings/account', async ({ page }) => {
    await page.goto('/dashboard/settings/account');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('page-login')).toBeVisible();
  });

  test('allows access to /dashboard when ?auth=true', async ({ page }) => {
    await page.goto('/dashboard?auth=true');
    await expect(page.getByTestId('page-dashboard')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('allows access to /dashboard/profile when ?auth=true', async ({ page }) => {
    await page.goto('/dashboard/profile?auth=true');
    await expect(page.getByTestId('page-dashboard-profile')).toBeVisible();
  });

  test('allows access to /dashboard/settings when ?auth=true', async ({ page }) => {
    await page.goto('/dashboard/settings?auth=true');
    await expect(page.getByTestId('page-dashboard-settings')).toBeVisible();
  });

  test('allows access to /dashboard/settings/account when ?auth=true', async ({ page }) => {
    await page.goto('/dashboard/settings/account?auth=true');
    await expect(page.getByTestId('page-dashboard-settings-account')).toBeVisible();
  });

  test('allows access to /dashboard/settings/security when ?auth=true', async ({ page }) => {
    await page.goto('/dashboard/settings/security?auth=true');
    await expect(page.getByTestId('page-dashboard-settings-security')).toBeVisible();
  });
});

test.describe('Admin guard', () => {
  test('redirects to /unauthorized when ?role=admin is absent', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/unauthorized/);
    await expect(page.getByTestId('page-unauthorized')).toBeVisible();
  });

  test('redirects to /unauthorized from /admin/users', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/unauthorized/);
    await expect(page.getByTestId('page-unauthorized')).toBeVisible();
  });

  test('redirects to /unauthorized from /admin/users/:id', async ({ page }) => {
    await page.goto('/admin/users/42');
    await expect(page).toHaveURL(/\/unauthorized/);
    await expect(page.getByTestId('page-unauthorized')).toBeVisible();
  });

  test('allows access to /admin when ?role=admin', async ({ page }) => {
    await page.goto('/admin?role=admin');
    await expect(page.getByTestId('page-admin')).toBeVisible();
    await expect(page).toHaveURL(/\/admin/);
  });

  test('allows access to /admin/users when ?role=admin', async ({ page }) => {
    await page.goto('/admin/users?role=admin');
    await expect(page.getByTestId('page-admin-users')).toBeVisible();
  });

  test('allows access to /admin/users/:id when ?role=admin', async ({ page }) => {
    await page.goto('/admin/users/42?role=admin');
    await expect(page.getByTestId('page-admin-user-detail')).toBeVisible();
  });
});

test.describe('Guard independence — different guards block different routes', () => {
  test('/about is accessible without any auth params', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByTestId('page-about')).toBeVisible();
  });

  test('/blog is accessible without any auth params', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByTestId('page-blog-index')).toBeVisible();
  });

  test('auth=true does NOT grant /admin access (needs role=admin)', async ({ page }) => {
    await page.goto('/admin?auth=true');
    await expect(page).toHaveURL(/\/unauthorized/);
    await expect(page.getByTestId('page-unauthorized')).toBeVisible();
  });

  test('role=admin does NOT grant /dashboard access (needs auth=true)', async ({ page }) => {
    await page.goto('/dashboard?role=admin');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('page-login')).toBeVisible();
  });
});

test.describe('Guard + layout composition', () => {
  test('dashboard guard fires before dashboard layout is rendered', async ({ page }) => {
    // Without auth, dashboard layout should never appear
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-layout')).not.toBeVisible();
    await expect(page.getByTestId('page-login')).toBeVisible();
  });

  test('admin guard fires before admin layout is rendered', async ({ page }) => {
    // Without role, admin layout should never appear
    await page.goto('/admin');
    await expect(page.getByTestId('admin-layout')).not.toBeVisible();
    await expect(page.getByTestId('page-unauthorized')).toBeVisible();
  });

  test('when guard passes, both guard target and layout are rendered', async ({ page }) => {
    await page.goto('/dashboard?auth=true');
    await expect(page.getByTestId('dashboard-layout')).toBeVisible();
    await expect(page.getByTestId('page-dashboard')).toBeVisible();
  });
});
