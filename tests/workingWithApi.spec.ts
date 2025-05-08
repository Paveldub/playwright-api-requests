import { test, expect, request } from '@playwright/test';
import { mockTags } from './tests-data/tags';
import { mockArticles } from './tests-data/articles';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/tags', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockTags),
    });
  });

  await page.goto('https://conduit.bondaracademy.com/');
  // user auth
  await page.getByText("Sign in").click();
  await page.getByRole('textbox', { name: 'Email' }).fill('demidovich.fiml@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Pasxarik1989!');
  await page.getByRole('button', { name: 'Sign in' }).click();
});

test('should show mocked articles and tags', async ({ page }) => {
  await page.route('**/api/articles**', async route => {    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockArticles),
    });
  });

  await page.getByText("Global Feed").click();
  await page.waitForSelector('.tag-list');
  await page.locator('.tag-list .tag-pill').allTextContents();

  for (const tag of mockTags.tags) {
    const count = await page.locator('.tag-list .tag-pill', { hasText: tag }).count();
    expect(count, `Tag "${tag}" should be visible on the page`).toBeGreaterThan(0);
  }

  const title = await page.locator('.navbar-brand').textContent();
  expect(title).toBe("conduit");

  await expect(page.locator('.article-preview h1').first()).toContainText('Vitalina MOCK title');
  await expect(page.locator('.article-preview p').first()).toContainText('Vitalina MOCK description');
});

test("delete article", async ({ page, request }) => {
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user":{"email":"demidovich.fiml@gmail.com","password":"Pasxarik1989!"}
    }
  });

  const responseBody = await response.json();
  const accessToken = responseBody.user.token;

  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
        "title": "test article",
        "description": "test article about",
        "body": "test article body",
        "tagList": []
      }
    },
    headers: {
      Authorization: `Token ${accessToken}`
    }
  });

  expect(articleResponse.status()).toEqual(201);

  await page.getByText("Global Feed").click();
  await page.getByText("test article").first().click();
  await page.getByRole("button", { name: "Delete Article" }).first().click();
  await page.getByText("Global Feed").click();

  await expect(page.locator('.article-preview h1').first()).not.toContainText('test article');
});