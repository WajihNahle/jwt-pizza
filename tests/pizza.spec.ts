// import { test, expect } from '@playwright/test' <- Replace this with the line below
import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { User, Role } from '../src/service/pizzaService';

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {
    'd@jwt.com': {
      id: '3',
      name: 'Kai Chen',
      email: 'd@jwt.com',
      password: 'a',
      roles: [{ role: Role.Diner }],
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

    if (method === 'POST' && loginReq && loginReq.email) {

      // Construct the response object
      const loginRes = {
        user: {
          name: 'test test',
          email: 'test@example.com',
          roles: [{ role: 'diner' }],
          id: 241
        },
        token: 'testtoken123'
      };
      // Fulfill the request with JSON
      await route.fulfill({ json: loginRes });
      return;
    }

    if (method === 'DELETE') {
      // Respond with success
      await route.fulfill({ status: 200, json: { message: 'Logout successfull' } });
      return;
    }

    // For all other requests to /api/auth (e.g. GET /api/auth/me), just continue
    await route.continue();
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

  await page.route(/.*\/api\/franchise\/\d+$/, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      const franchiseRes = [
        {
          "id": 2,
          "name": "pizzaPocket",
          "admins": [
            {
              "id": 4,
              "name": "pizza franchisee",
              "email": "f@jwt.com"
            }
          ],
          "stores": [
            {
              "id": 4,
              "name": "SLC",
              "totalRevenue": 0
            }
          ]
        }
      ]
      // Fulfill the request with JSON
      await route.fulfill({ json: franchiseRes });
      return;
    }
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
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


test('login', async ({ page }) => {
  await basicInit(page);

  await login(page);

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('purchase with login', async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

test("logout and register", async ({ page }) => {
  await basicInit(page);

  // Register
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByPlaceholder('Name').click();
  await page.getByPlaceholder('Name').fill('test test');
  await page.getByPlaceholder('Email address').fill('test@example.com');
  await page.getByPlaceholder('Password').fill('test');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByRole('link', { name: 'tt' })).toBeVisible();

  // Logout
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});

test("check footer pages", async ({ page }) => {
  await basicInit(page);
  await login(page);

  //History
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page).toHaveURL(/.*history/i);

  // About
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/.*about/i);

  // User Your Kitchen page
  await page.getByRole('link', { name: 'KC' }).click();
  await expect(page).toHaveURL(/.*diner/i);

  // docs
  await page.goto('/docs');
  await expect(page).toHaveURL(/.*docs/i);

  // Franchise
  await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
  await expect(page).toHaveURL(/.*franchise/i);
});

async function login(page: Page) {
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
}
