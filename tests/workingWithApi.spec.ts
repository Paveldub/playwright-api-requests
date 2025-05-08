import { test, expect } from '@playwright/test';
import { mockTags } from './tests-data/tags';
import { mockArticles } from './tests-data/articles';

// Setup common test fixtures
test.beforeEach(async ({ page }) => {
  // Create mock for tags
  await page.route('**/api/tags', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockTags),
    });
  });

  // Mock articles API with direct response instead of fetching first
  await page.route('**/api/articles**', async route => {    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockArticles),
    });
  });

  // Navigate to the page after setting up routes
  await page.goto('https://conduit.bondaracademy.com/');
});

test('verify mocked tags are displayed', async ({ page }) => {
  await page.waitForSelector('.tag-list');

  await page.locator('.tag-list .tag-pill').allTextContents();

  for (const tag of mockTags.tags) {
    const count = await page.locator('.tag-list .tag-pill', { hasText: tag }).count();
    
    expect(count, `Tag "${tag}" should be visible on the page`).toBeGreaterThan(0);
  }
});

test('verify mocked article content', async ({ page }) => {
  // Verify the navbar title
  const title = await page.locator('.navbar-brand').textContent();
  expect(title).toBe("conduit");

  // Verify the mocked article content
  await expect(page.locator('.article-preview h1').first()).toContainText('Vitalina title');
  await expect(page.locator('.article-preview p').first()).toContainText('Vitalina description');
});
