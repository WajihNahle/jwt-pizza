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

  await page.route("*/**/api/docs", async (route) => {
    const docsRes = {
      "version": "20240518.154317",
      "endpoints": [
        {
        "method": "POST",
        "path": "/api/auth",
        "description": "Register a new user",
        "example": "curl -X POST localhost:3000/api/auth -d '{\"name\":\"pizza diner\", \"email\":\"d@jwt.com\", \"password\":\"diner\"}' -H 'Content-Type: application/json'",
        "response": {
          "user": {
            "id": 2,
            "name": "pizza diner",
            "email": "d@jwt.com",
            "roles": [
              {
                "role": "diner"
              }
            ]
          },
          "token": "tttttt"
        }
      },
      {
        "method": "PUT",
        "path": "/api/auth",
        "description": "Login existing user",
        "example": "curl -X PUT localhost:3000/api/auth -d '{\"email\":\"a@jwt.com\", \"password\":\"admin\"}' -H 'Content-Type: application/json'",
        "response": {
          "user": {
            "id": 1,
            "name": "常用名字",
            "email": "a@jwt.com",
            "roles": [
              {
                "role": "admin"
              }
            ]
          },
          "token": "tttttt"
        }
      },
      {
        "method": "DELETE",
        "path": "/api/auth",
        "requiresAuth": true,
        "description": "Logout a user",
        "example": "curl -X DELETE localhost:3000/api/auth -H 'Authorization: Bearer tttttt'",
        "response": {
          "message": "logout successful"
        }
      },
      {
        "method": "GET",
        "path": "/api/user/me",
        "requiresAuth": true,
        "description": "Get authenticated user",
        "example": "curl -X GET localhost:3000/api/user/me -H 'Authorization: Bearer tttttt'",
        "response": {
          "id": 1,
          "name": "常用名字",
          "email": "a@jwt.com",
          "roles": [
            {
              "role": "admin"
            }
          ]
        }
      },
      {
        "method": "PUT",
        "path": "/api/user/:userId",
        "requiresAuth": true,
        "description": "Update user",
        "example": "curl -X PUT localhost:3000/api/user/1 -d '{\"name\":\"常用名字\", \"email\":\"a@jwt.com\", \"password\":\"admin\"}' -H 'Content-Type: application/json' -H 'Authorization: Bearer tttttt'",
        "response": {
          "user": {
            "id": 1,
            "name": "常用名字",
            "email": "a@jwt.com",
            "roles": [
              {
                "role": "admin"
              }
            ]
          },
          "token": "tttttt"
        }
      },
      {
        "method": "GET",
        "path": "/api/order/menu",
        "description": "Get the pizza menu",
        "example": "curl localhost:3000/api/order/menu",
        "response": [
          {
            "id": 1,
            "title": "Veggie",
            "image": "pizza1.png",
            "price": 0.0038,
            "description": "A garden of delight"
          }
        ]
      },
      {
        "method": "PUT",
        "path": "/api/order/menu",
        "requiresAuth": true,
        "description": "Add an item to the menu",
        "example": "curl -X PUT localhost:3000/api/order/menu -H 'Content-Type: application/json' -d '{ \"title\":\"Student\", \"description\": \"No topping, no sauce, just carbs\", \"image\":\"pizza9.png\", \"price\": 0.0001 }'  -H 'Authorization: Bearer tttttt'",
        "response": [
          {
            "id": 1,
            "title": "Student",
            "description": "No topping, no sauce, just carbs",
            "image": "pizza9.png",
            "price": 0.0001
          }
        ]
      },
      {
        "method": "GET",
        "path": "/api/order",
        "requiresAuth": true,
        "description": "Get the orders for the authenticated user",
        "example": "curl -X GET localhost:3000/api/order  -H 'Authorization: Bearer tttttt'",
        "response": {
          "dinerId": 4,
          "orders": [
            {
              "id": 1,
              "franchiseId": 1,
              "storeId": 1,
              "date": "2024-06-05T05:14:40.000Z",
              "items": [
                {
                  "id": 1,
                  "menuId": 1,
                  "description": "Veggie",
                  "price": 0.05
                }
              ]
            }
          ],
          "page": 1
        }
      },
      {
        "method": "POST",
        "path": "/api/order",
        "requiresAuth": true,
        "description": "Create a order for the authenticated user",
        "example": "curl -X POST localhost:3000/api/order -H 'Content-Type: application/json' -d '{\"franchiseId\": 1, \"storeId\":1, \"items\":[{ \"menuId\": 1, \"description\": \"Veggie\", \"price\": 0.05 }]}'  -H 'Authorization: Bearer tttttt'",
        "response": {
          "order": {
            "franchiseId": 1,
            "storeId": 1,
            "items": [
              {
                "menuId": 1,
                "description": "Veggie",
                "price": 0.05
              }
            ],
            "id": 1
          },
          "jwt": "1111111111"
        }
      },
      {
        "method": "GET",
        "path": "/api/franchise?page=0&limit=10&name=*",
        "description": "List all the franchises",
        "example": "curl localhost:3000/api/franchise&page=0&limit=10&name=pizzaPocket",
        "response": {
          "franchises": [
            {
              "id": 1,
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
                  "id": 1,
                  "name": "SLC",
                  "totalRevenue": 0
                }
              ]
            }
          ],
          "more": true
        }
      },
      {
        "method": "GET",
        "path": "/api/franchise/:userId",
        "requiresAuth": true,
        "description": "List a user's franchises",
        "example": "curl localhost:3000/api/franchise/4  -H 'Authorization: Bearer tttttt'",
        "response": [
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
      },
      {
        "method": "POST",
        "path": "/api/franchise",
        "requiresAuth": true,
        "description": "Create a new franchise",
        "example": "curl -X POST localhost:3000/api/franchise -H 'Content-Type: application/json' -H 'Authorization: Bearer tttttt' -d '{\"name\": \"pizzaPocket\", \"admins\": [{\"email\": \"f@jwt.com\"}]}'",
        "response": {
          "name": "pizzaPocket",
          "admins": [
            {
              "email": "f@jwt.com",
              "id": 4,
              "name": "pizza franchisee"
            }
          ],
          "id": 1
        }
      },
      {
        "method": "DELETE",
        "path": "/api/franchise/:franchiseId",
        "requiresAuth": true,
        "description": "Delete a franchises",
        "example": "curl -X DELETE localhost:3000/api/franchise/1 -H 'Authorization: Bearer tttttt'",
        "response": {
          "message": "franchise deleted"
        }
      },
      {
        "method": "POST",
        "path": "/api/franchise/:franchiseId/store",
        "requiresAuth": true,
        "description": "Create a new franchise store",
        "example": "curl -X POST localhost:3000/api/franchise/1/store -H 'Content-Type: application/json' -d '{\"franchiseId\": 1, \"name\":\"SLC\"}' -H 'Authorization: Bearer tttttt'",
        "response": {
          "id": 1,
          "name": "SLC",
          "totalRevenue": 0
        }
      },
      {
        "method": "DELETE",
        "path": "/api/franchise/:franchiseId/store/:storeId",
        "requiresAuth": true,
        "description": "Delete a store",
        "example": "curl -X DELETE localhost:3000/api/franchise/1/store/1  -H 'Authorization: Bearer tttttt'",
        "response": {
          "message": "store deleted"
        }
      }
      ],
      "config": {
        "factory": "https://pizza-factory.cs329.click",
        "db": "127.0.0.1"
      }
    }
    await route.fulfill({ json: docsRes });
    return;
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

test('cancel with login', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('main')).toContainText('Pick your store');
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

test("register failure shows error message", async ({ page }) => {
  await basicInit(page);

  // Override the POST /api/auth route to return an error
  await page.route("**/api/auth", async (route) => {
    await route.fulfill({ status: 500, json: { error: "Registration failed" } });
  });

  // Go to register page
  await page.getByRole('link', { name: 'Register' }).click();

  // Fill the form
  await page.getByPlaceholder('Name').fill('error user');
  await page.getByPlaceholder('Email address').fill('error@example.com');
  await page.getByPlaceholder('Password').fill('password');

  // Click Register
  await page.getByRole('button', { name: 'Register' }).click();

  // Expect the error message to be displayed
  await expect(page.getByRole('main')).toContainText('{"code":500}');
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
