import { test, expect } from '@playwright/test';
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
  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
        "title": "test article",
        "description": "test article about",
        "body": "test article body",
        "tagList": []
      }
    }
  });

  expect(articleResponse.status()).toEqual(201);

  await page.getByText("Global Feed").click();
  await page.getByText("test article").first().click();
  await page.getByRole("button", { name: "Delete Article" }).first().click();
  await page.getByText("Global Feed").click();

  await expect(page.locator('.article-preview h1').first()).not.toContainText('test article');
});

// Intercept api request
test("create article", async ({ page, request }) => {
  await page.getByText("New Article").click();

  await page.getByRole('textbox', { name: 'article title' }).fill('Playwright awesome article');
  await page.getByRole('textbox', { name: 'What\'s this article about?' }).fill('Playwright article about');
  await page.getByRole('textbox', { name: 'Write your article (in markdown)' }).fill('Playwright article body');
  await page.getByRole('button', { name: 'Publish Article' }).click();

  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/');
  const articleResponseBody = await articleResponse.json();
  const slugId = articleResponseBody.article.slug;

  await expect(page.locator('.article-page h1').first()).toContainText('Playwright awesome article');

  await page.getByText("Home").click();
  await page.getByText("Global Feed").click();

  await expect(page.locator('.article-preview h1').first()).toContainText('Playwright awesome article');

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`);

  expect(deleteArticleResponse.status()).toEqual(204);
})