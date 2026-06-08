import { test, expect } from '@playwright/test';

/**
 * Route group (parenthesis folder) feature tests.
 *
 * Groups are folders named (name) that contribute NO segment to the URL but
 * can carry their own layout.tsx and/or guard.tsx.
 *
 * Scenarios exercised:
 *
 *  (marketing)  — layout only, no guard
 *    /pricing    src/routes/(marketing)/pricing.tsx
 *    /features   src/routes/(marketing)/features.tsx
 *
 *  (members)    — guard + layout  (?member=true required → /login)
 *    /account    src/routes/(members)/account.tsx
 *    /billing    src/routes/(members)/billing.tsx
 *
 *  (beta)       — guard only, no layout  (?beta=true required → /unauthorized)
 *    /beta-features  src/routes/(beta)/beta-features.tsx
 *
 *  (shop)/(checkout)  — nested groups, both layouts stack
 *    /payment    src/routes/(shop)/(checkout)/payment.tsx
 */

// ─── Group URL resolution ────────────────────────────────────────────────────

test.describe('Group folder: URL resolution', () => {
  test('(marketing)/pricing.tsx resolves to /pricing (no group in URL)', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByTestId('page-pricing')).toBeVisible();
    expect(page.url()).toMatch(/\/pricing$/);
  });

  test('(marketing)/features.tsx resolves to /features (no group in URL)', async ({ page }) => {
    await page.goto('/features');
    await expect(page.getByTestId('page-features')).toBeVisible();
    expect(page.url()).toMatch(/\/features$/);
  });

  test('(members)/account.tsx resolves to /account', async ({ page }) => {
    await page.goto('/account?member=true');
    await expect(page.getByTestId('page-account')).toBeVisible();
    expect(page.url()).toMatch(/\/account/);
  });

  test('(members)/billing.tsx resolves to /billing', async ({ page }) => {
    await page.goto('/billing?member=true');
    await expect(page.getByTestId('page-billing')).toBeVisible();
    expect(page.url()).toMatch(/\/billing/);
  });

  test('(beta)/beta-features.tsx resolves to /beta-features', async ({ page }) => {
    await page.goto('/beta-features?beta=true');
    await expect(page.getByTestId('page-beta-features')).toBeVisible();
    expect(page.url()).toMatch(/\/beta-features/);
  });

  test('(shop)/(checkout)/payment.tsx resolves to /payment (both group names stripped)', async ({ page }) => {
    await page.goto('/payment');
    await expect(page.getByTestId('page-payment')).toBeVisible();
    expect(page.url()).toMatch(/\/payment$/);
  });
});

// ─── Group layout scope ──────────────────────────────────────────────────────

test.describe('Group folder: layout scope — (marketing)', () => {
  test('marketing layout is visible on /pricing', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByTestId('marketing-layout')).toBeVisible();
  });

  test('marketing layout is visible on /features', async ({ page }) => {
    await page.goto('/features');
    await expect(page.getByTestId('marketing-layout')).toBeVisible();
  });

  test('marketing layout is NOT visible on /about', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByTestId('marketing-layout')).not.toBeVisible();
  });

  test('marketing layout is NOT visible on /', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('marketing-layout')).not.toBeVisible();
  });

  test('marketing layout is NOT visible on /blog', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByTestId('marketing-layout')).not.toBeVisible();
  });

  test('root layout AND marketing layout are both visible on /pricing', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByTestId('root-layout-header')).toBeVisible();
    await expect(page.getByTestId('marketing-layout')).toBeVisible();
  });
});

test.describe('Group folder: layout scope — (members)', () => {
  test('members layout is visible on /account when member passes', async ({ page }) => {
    await page.goto('/account?member=true');
    await expect(page.getByTestId('group-members-layout')).toBeVisible();
  });

  test('members layout is visible on /billing when member passes', async ({ page }) => {
    await page.goto('/billing?member=true');
    await expect(page.getByTestId('group-members-layout')).toBeVisible();
  });

  test('members layout is NOT visible on /pricing (different group)', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByTestId('group-members-layout')).not.toBeVisible();
  });

  test('members layout is NOT visible on /about', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByTestId('group-members-layout')).not.toBeVisible();
  });
});

test.describe('Group folder: nested layouts — (shop)/(checkout)', () => {
  test('both shop and checkout layouts are visible on /payment', async ({ page }) => {
    await page.goto('/payment');
    await expect(page.getByTestId('group-shop-layout')).toBeVisible();
    await expect(page.getByTestId('group-checkout-layout')).toBeVisible();
    await expect(page.getByTestId('page-payment')).toBeVisible();
  });

  test('shop layout is NOT visible on /pricing (different group)', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByTestId('group-shop-layout')).not.toBeVisible();
  });

  test('checkout layout is NOT visible on /about', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByTestId('group-checkout-layout')).not.toBeVisible();
  });

  test('root layout AND both group layouts visible on /payment', async ({ page }) => {
    await page.goto('/payment');
    await expect(page.getByTestId('root-layout-header')).toBeVisible();
    await expect(page.getByTestId('group-shop-layout')).toBeVisible();
    await expect(page.getByTestId('group-checkout-layout')).toBeVisible();
  });
});

// ─── Group guard — block ─────────────────────────────────────────────────────

test.describe('Group folder: guard blocks — (members)', () => {
  test('redirects /account to /login without ?member=true', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('page-login')).toBeVisible();
  });

  test('redirects /billing to /login without ?member=true', async ({ page }) => {
    await page.goto('/billing');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('page-login')).toBeVisible();
  });

  test('members layout never renders when guard blocks /account', async ({ page }) => {
    await page.goto('/account');
    await expect(page.getByTestId('group-members-layout')).not.toBeVisible();
    await expect(page.getByTestId('page-login')).toBeVisible();
  });

  test('members layout never renders when guard blocks /billing', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.getByTestId('group-members-layout')).not.toBeVisible();
    await expect(page.getByTestId('page-login')).toBeVisible();
  });
});

test.describe('Group folder: guard blocks — (beta)', () => {
  test('redirects /beta-features to /unauthorized without ?beta=true', async ({ page }) => {
    await page.goto('/beta-features');
    await expect(page).toHaveURL(/\/unauthorized/);
    await expect(page.getByTestId('page-unauthorized')).toBeVisible();
  });
});

// ─── Group guard — allow ─────────────────────────────────────────────────────

test.describe('Group folder: guard allows — (members)', () => {
  test('allows /account when ?member=true', async ({ page }) => {
    await page.goto('/account?member=true');
    await expect(page.getByTestId('page-account')).toBeVisible();
    await expect(page).toHaveURL(/\/account/);
  });

  test('allows /billing when ?member=true', async ({ page }) => {
    await page.goto('/billing?member=true');
    await expect(page.getByTestId('page-billing')).toBeVisible();
    await expect(page).toHaveURL(/\/billing/);
  });

  test('root layout visible alongside members layout on /account', async ({ page }) => {
    await page.goto('/account?member=true');
    await expect(page.getByTestId('root-layout-header')).toBeVisible();
    await expect(page.getByTestId('group-members-layout')).toBeVisible();
  });
});

test.describe('Group folder: guard allows — (beta)', () => {
  test('allows /beta-features when ?beta=true', async ({ page }) => {
    await page.goto('/beta-features?beta=true');
    await expect(page.getByTestId('page-beta-features')).toBeVisible();
    await expect(page).toHaveURL(/\/beta-features/);
  });
});

// ─── Group isolation ─────────────────────────────────────────────────────────

test.describe('Group folder: guard isolation — groups do not bleed into each other', () => {
  test('?member=true does NOT grant access to (beta) routes', async ({ page }) => {
    await page.goto('/beta-features?member=true');
    await expect(page).toHaveURL(/\/unauthorized/);
    await expect(page.getByTestId('page-unauthorized')).toBeVisible();
  });

  test('?beta=true does NOT grant access to (members) routes', async ({ page }) => {
    await page.goto('/account?beta=true');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('page-login')).toBeVisible();
  });

  test('(marketing) routes are accessible regardless of member/beta params', async ({ page }) => {
    // No guard on (marketing) — should always work
    await page.goto('/pricing');
    await expect(page.getByTestId('page-pricing')).toBeVisible();

    await page.goto('/features');
    await expect(page.getByTestId('page-features')).toBeVisible();
  });

  test('(beta) guard does not affect (members) layout on allowed routes', async ({ page }) => {
    // /account?member=true — members layout should be present, not beta-related
    await page.goto('/account?member=true');
    await expect(page.getByTestId('group-members-layout')).toBeVisible();
    await expect(page.getByTestId('page-account')).toBeVisible();
  });
});
