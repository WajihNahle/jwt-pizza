// import { test, expect } from '@playwright/test' <- Replace this with the line below
import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { User, Role } from '../src/service/pizzaService';

async function basicInit(page: Page) {
let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {
    'a@jwt.com': {
      id: '3',
      name: 'pizza diner',
      email: 'a@jwt.com',
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

    if (method === 'DELETE') {
      const loginRes = { "message": "logout successful" };
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
    }
  });


  await page.route(/.*\/api\/user\/\d+$/, async (route) => {
    const method = route.request().method();
    if (method === 'PUT') {
      // Respond with success
      await route.fulfill({ status: 200, json: {"email":"a@jwt.com", "roles":[{"role": "diner"}]} });
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
          { id: 5, name: 'CheesyBites', stores: [{ id: 8, name: 'Downtown' }] },
          { id: 6, name: 'PizzaHub', stores: [{ id: 9, name: 'Uptown' }] },
          { id: 7, name: 'SliceMasters', stores: [{ id: 10, name: 'Eastside' }] },
          { id: 8, name: 'PieZone', stores: [{ id: 11, name: 'Westend' }] },
          { id: 9, name: 'DoughNation', stores: [{ id: 12, name: 'North Point' }] },
          { id: 10, name: 'PizzaPlanet', stores: [{ id: 13, name: 'South Park' }] },
          { id: 11, name: 'The Pizza Joint', stores: [{ id: 14, name: 'Old Town' }] },
          { id: 12, name: 'HotSlice', stores: [{ id: 15, name: 'Riverfront' }] },
          { id: 13, name: 'Round Table', stores: [{ id: 16, name: 'Hilltop' }] },
          { id: 13, name: 'Box Table', stores: [{ id: 17, name: 'topy' }] },
        ]
        ,
    };
    await route.fulfill({ json: franchiseRes });
  });

  // Standard user
  await page.route(/\/api\/user(\?.*)?$/, async (route) => {
    const franchiseRes = {
      users: [ {
          id: '1',
          name: 'Big Boss',
          email: 'a@jwt.com',
          password: 'a',
          roles: [{ role: Role.Admin }],
        },
        {
          id: '2',
          name: 'Little Boss',
          email: 'l@jwt.com',
          password: 'a',
          roles: [{ role: Role.Diner }],
        },
        {
          id: '3',
          name: ' Boss y',
          email: 'o@jwt.com',
          password: 'a',
          roles: [{ role: Role.Admin }],
        },
        {
          id: '4',
          name: 't t',
          email: 'p@jwt.com',
          password: 'a',
          roles: [{ role: Role.Diner }],
        },{
          id: '5',
          name: 'r r',
          email: '[@jwt.com',
          password: 'a',
          roles: [{ role: Role.Admin }],
        },
        {
          id: '6',
          name: 'e e',
          email: 'oi@jwt.com',
          password: 'a',
          roles: [{ role: Role.Diner }],
        },{
          id: '7',
          name: 'd d',
          email: 'esr@jwt.com',
          password: 'a',
          roles: [{ role: Role.Admin }],
        },
        {
          id: '8',
          name: 'c c',
          email: 'ear@jwt.com',
          password: 'a',
          roles: [{ role: Role.Diner }],
        },{
          id: '9',
          name: 'b b',
          email: 'sg@jwt.com',
          password: 'a',
          roles: [{ role: Role.Admin }],
        },
        {
          id: '10',
          name: 'a a',
          email: 'fsg@jwt.com',
          password: 'a',
          roles: [{ role: Role.Diner }],
        },
        {
          id: '11',
          name: 'ab ab',
          email: 'fsg@jwt.com',
          password: 'a',
          roles: [{ role: Role.Diner }],
        }
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

  // await page.route()

  await page.goto('/');
}
test('updateUser1', async({ page }) => {
    await basicInit(page)
    await login(page)

});

async function login(page: Page) {
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
}

test('updateUser mocked', async ({ page }) => {
  // Initialize all mocked routes
  await basicInit(page);

  // "Login" the user via mock
  await login(page);

  // Navigate to "pd" (profile/dashboard)
  await page.getByRole('link', { name: 'pd' }).click();

  // The main content should show the logged in user's name from mock
  await expect(page.getByRole('main')).toContainText('pizza diner');

  // Simulate editing the user
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');

  // Fill new data
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('textbox').nth(1).fill('newEmail@jwt.com');
  await page.getByRole('textbox').nth(2).fill('newPassword');

  // Click update
  await page.getByRole('button', { name: 'Update' }).click();

  // Wait a short time for mock to process (optional, safer than dialog check)
  await page.waitForTimeout(200);

  // Assert main content updated
  await expect(page.getByRole('main')).toContainText('pizza dinerx');

  // Logout and login with new credentials
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill("newEmail@jwt.com");
  await page.getByRole('textbox', { name: 'Password' }).fill('newPassword');
  await page.getByRole('button', { name: 'Login' }).click();

//   // Check main content again
//   await page.getByRole('link', { name: 'pd' }).click();
//   await expect(page.getByRole('main')).toContainText('pizza dinerx');
});


