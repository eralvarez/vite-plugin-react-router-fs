import { test, expect } from '@playwright/test';

/**
 * Layout nesting tests.
 *
 * Validates:
 * - Root layout (nav bar) is visible on every route
 * - Section-specific layouts only appear within their path prefix
 * - Layouts nest correctly (root + section both visible simultaneously)
 */

test.describe('Root layout is omnipresent', () => {
  const routes = [
    '/',
    '/about',
    '/blog',
    '/blog/hello-world',
    '/login',
    '/unauthorized',
  ];

  for (const route of routes) {
    test(`root layout header is visible on ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByTestId('root-layout-header')).toBeVisible();
    });
  }

  test('root layout header is visible on /dashboard when authenticated', async ({
    page,
  }) => {
    await page.goto('/dashboard?auth=true');
    await expect(page.getByTestId('root-layout-header')).toBeVisible();
  });

  test('root layout header is visible on /admin when authorized', async ({
    page,
  }) => {
    await page.goto('/admin?role=admin');
    await expect(page.getByTestId('root-layout-header')).toBeVisible();
  });
});

test.describe('Blog layout', () => {
  test('blog layout is visible on /blog', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByTestId('blog-layout')).toBeVisible();
  });

  test('blog layout is visible on /blog/:slug', async ({ page }) => {
    await page.goto('/blog/my-post');
    await expect(page.getByTestId('blog-layout')).toBeVisible();
  });

  test('blog layout is NOT visible on /about', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByTestId('blog-layout')).not.toBeVisible();
  });

  test('blog layout is NOT visible on /', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('blog-layout')).not.toBeVisible();
  });

  test('blog layout is NOT visible on /dashboard (authenticated)', async ({
    page,
  }) => {
    await page.goto('/dashboard?auth=true');
    await expect(page.getByTestId('blog-layout')).not.toBeVisible();
  });

  test('root layout AND blog layout are both visible on /blog', async ({
    page,
  }) => {
    await page.goto('/blog');
    await expect(page.getByTestId('root-layout-header')).toBeVisible();
    await expect(page.getByTestId('blog-layout')).toBeVisible();
  });
});

test.describe('Dashboard layout', () => {
  test('dashboard layout is visible on /dashboard when authenticated', async ({
    page,
  }) => {
    await page.goto('/dashboard?auth=true');
    await expect(page.getByTestId('dashboard-layout')).toBeVisible();
  });

  test('dashboard layout is visible on /dashboard/profile when authenticated', async ({
    page,
  }) => {
    await page.goto('/dashboard/profile?auth=true');
    await expect(page.getByTestId('dashboard-layout')).toBeVisible();
  });

  test('dashboard layout is visible on /dashboard/settings when authenticated', async ({
    page,
  }) => {
    await page.goto('/dashboard/settings?auth=true');
    await expect(page.getByTestId('dashboard-layout')).toBeVisible();
  });

  test('dashboard layout is NOT visible on /about', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByTestId('dashboard-layout')).not.toBeVisible();
  });

  test('dashboard layout is NOT visible on /blog', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByTestId('dashboard-layout')).not.toBeVisible();
  });

  test('dashboard layout is NOT visible on /admin (authorized)', async ({
    page,
  }) => {
    await page.goto('/admin?role=admin');
    await expect(page.getByTestId('dashboard-layout')).not.toBeVisible();
  });

  test('root AND dashboard layouts both visible on /dashboard (authenticated)', async ({
    page,
  }) => {
    await page.goto('/dashboard?auth=true');
    await expect(page.getByTestId('root-layout-header')).toBeVisible();
    await expect(page.getByTestId('dashboard-layout')).toBeVisible();
  });
});

test.describe('Admin layout', () => {
  test('admin layout is visible on /admin when authorized', async ({
    page,
  }) => {
    await page.goto('/admin?role=admin');
    await expect(page.getByTestId('admin-layout')).toBeVisible();
  });

  test('admin layout is visible on /admin/users when authorized', async ({
    page,
  }) => {
    await page.goto('/admin/users?role=admin');
    await expect(page.getByTestId('admin-layout')).toBeVisible();
  });

  test('admin layout is visible on /admin/users/:id when authorized', async ({
    page,
  }) => {
    await page.goto('/admin/users/42?role=admin');
    await expect(page.getByTestId('admin-layout')).toBeVisible();
  });

  test('admin layout is NOT visible on /about', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByTestId('admin-layout')).not.toBeVisible();
  });

  test('admin layout is NOT visible on /dashboard (authenticated)', async ({
    page,
  }) => {
    await page.goto('/dashboard?auth=true');
    await expect(page.getByTestId('admin-layout')).not.toBeVisible();
  });

  test('root AND admin layouts both visible on /admin (authorized)', async ({
    page,
  }) => {
    await page.goto('/admin?role=admin');
    await expect(page.getByTestId('root-layout-header')).toBeVisible();
    await expect(page.getByTestId('admin-layout')).toBeVisible();
  });

  test('root, admin layouts both visible on /admin/users/:id (authorized)', async ({
    page,
  }) => {
    await page.goto('/admin/users/1?role=admin');
    await expect(page.getByTestId('root-layout-header')).toBeVisible();
    await expect(page.getByTestId('admin-layout')).toBeVisible();
  });
});
