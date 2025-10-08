// import { test, expect } from '@playwright/test' <- Replace this with the line below
import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { User, Role } from '../src/service/pizzaService';

async function basicInit(page: Page) {
let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {
    'a@jwt.com': {
      id: '3',
      name: 'Big Boss',
      email: 'a@jwt.com',
      password: 'a',
      roles: [{ role: Role.Admin }],
    },
  };

  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    // Only handle JSON PUT requests
    const method = route.request().method();
    let loginReq: any = null;

    try {
      loginReq = route.request().postDataJSON();
    } catch {
      // postDataJSON() will throw if no body or invalid JSON — ignore safely
    }

    if (method === 'PUT' && loginReq && loginReq.email) {
      const user = validUsers[loginReq.email];
      if (!user || user.password !== loginReq.password) {
        await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
        return;
      }
      loggedInUser = user;
      const loginRes = { user: loggedInUser, token: 'abcdef' };
      await route.fulfill({ json: loginRes });
      return;
    }

    // For all other requests to /api/auth (e.g. GET /api/auth/me), just continue
    await route.continue();
  });

  await page.route(/.*\/api\/franchise\/\d+$/, async (route) => {
    const method = route.request().method();
    if (method === 'DELETE') {
      // Respond with success
      await route.fulfill({ status: 200, json: { message: 'franchise deleted' } });
      return;
    }
  });

  // Return the currently logged-in user
  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'testing' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    await route.fulfill({ json: franchiseRes });
  });

  // Order a pizza
  await page.route('*/**/api/order', async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = { order: { ...orderReq, id: 23 }, jwt: 'eyJpYXQ' };
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');
}

test('login as admin', async ({ page }) => {
    await basicInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('link', { name: 'BB' })).toBeVisible();
});

test('delete and create franchise', async ({ page }) => {
    await basicInit(page);
    await login(page);

    //delete franchise
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('row', { name: 'LotaPizza Close' }).getByRole('button').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('row', { name: 'LotaPizza Close' })).not.toBeVisible();

    //create
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
});

async function login(page: Page) {
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
}
