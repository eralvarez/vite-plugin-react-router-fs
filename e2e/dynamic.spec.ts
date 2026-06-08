import { test, expect } from '@playwright/test';

/**
 * Dynamic route and catch-all tests.
 *
 * Validates:
 * - /blog/:slug renders with the correct slug param
 * - /admin/users/:id renders with the correct id param
 * - Unknown paths hit the [...slug] catch-all
 */

test.describe('/blog/:slug — dynamic route', () => {
  test('/blog/getting-started renders with correct slug', async ({ page }) => {
    await page.goto('/blog/getting-started');
    await expect(page.getByTestId('page-blog-post')).toBeVisible();
    await expect(page.getByTestId('blog-slug')).toHaveText('getting-started');
  });

  test('/blog/advanced-routing renders with correct slug', async ({ page }) => {
    await page.goto('/blog/advanced-routing');
    await expect(page.getByTestId('page-blog-post')).toBeVisible();
    await expect(page.getByTestId('blog-slug')).toHaveText('advanced-routing');
  });

  test('/blog/hello-world renders with correct slug', async ({ page }) => {
    await page.goto('/blog/hello-world');
    await expect(page.getByTestId('page-blog-post')).toBeVisible();
    await expect(page.getByTestId('blog-slug')).toHaveText('hello-world');
  });

  test('/blog/any-random-slug renders with the provided slug', async ({
    page,
  }) => {
    await page.goto('/blog/any-random-slug');
    await expect(page.getByTestId('page-blog-post')).toBeVisible();
    await expect(page.getByTestId('blog-slug')).toHaveText('any-random-slug');
  });

  test('blog layout wraps /blog/:slug posts', async ({ page }) => {
    await page.goto('/blog/test-post');
    await expect(page.getByTestId('blog-layout')).toBeVisible();
    await expect(page.getByTestId('page-blog-post')).toBeVisible();
  });

  test('navigating between blog posts updates the slug', async ({ page }) => {
    await page.goto('/blog/first-post');
    await expect(page.getByTestId('blog-slug')).toHaveText('first-post');

    await page.goto('/blog/second-post');
    await expect(page.getByTestId('blog-slug')).toHaveText('second-post');
  });
});

test.describe('/admin/users/:id — dynamic route (guarded)', () => {
  test('/admin/users/1 renders user id 1 when authorized', async ({ page }) => {
    await page.goto('/admin/users/1?role=admin');
    await expect(page.getByTestId('page-admin-user-detail')).toBeVisible();
    await expect(page.getByTestId('user-id')).toHaveText('#1');
  });

  test('/admin/users/42 renders user id 42 when authorized', async ({
    page,
  }) => {
    await page.goto('/admin/users/42?role=admin');
    await expect(page.getByTestId('page-admin-user-detail')).toBeVisible();
    await expect(page.getByTestId('user-id')).toHaveText('#42');
  });

  test('/admin/users/999 renders user id 999 when authorized', async ({
    page,
  }) => {
    await page.goto('/admin/users/999?role=admin');
    await expect(page.getByTestId('page-admin-user-detail')).toBeVisible();
    await expect(page.getByTestId('user-id')).toHaveText('#999');
  });

  test('/admin/users/:id is blocked without role=admin', async ({ page }) => {
    await page.goto('/admin/users/42');
    await expect(page).toHaveURL(/\/unauthorized/);
    await expect(page.getByTestId('page-admin-user-detail')).not.toBeVisible();
  });

  test('admin layout wraps /admin/users/:id when authorized', async ({
    page,
  }) => {
    await page.goto('/admin/users/2?role=admin');
    await expect(page.getByTestId('admin-layout')).toBeVisible();
    await expect(page.getByTestId('page-admin-user-detail')).toBeVisible();
  });
});

test.describe('[...slug] catch-all route', () => {
  test('/unknown renders the 404 catch-all', async ({ page }) => {
    await page.goto('/unknown');
    await expect(page.getByTestId('page-not-found')).toBeVisible();
  });

  test('/a/b/c renders the catch-all with its path', async ({ page }) => {
    await page.goto('/a/b/c');
    await expect(page.getByTestId('page-not-found')).toBeVisible();
    await expect(page.getByText('/a/b/c')).toBeVisible();
  });

  test('/does/not/exist/at/all renders the catch-all', async ({ page }) => {
    await page.goto('/does/not/exist/at/all');
    await expect(page.getByTestId('page-not-found')).toBeVisible();
  });

  test('catch-all page shows the attempted path', async ({ page }) => {
    await page.goto('/some/random/path');
    await expect(page.getByTestId('page-not-found')).toBeVisible();
    await expect(page.getByText('/some/random/path')).toBeVisible();
  });

  test('root layout is visible on catch-all page', async ({ page }) => {
    await page.goto('/definitely-not-a-route');
    await expect(page.getByTestId('root-layout-header')).toBeVisible();
    await expect(page.getByTestId('page-not-found')).toBeVisible();
  });
});
