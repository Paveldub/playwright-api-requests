import { test, expect } from '@playwright/test';

test('verify mocked tags are displayed', async ({ page }) => {
  const mockTags = {
    "tags": [
      "Pavel",
      "Playwright",
      "test"
    ]
  };

  await page.route('https://conduit-api.bondaracademy.com/api/tags', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockTags),
    });
  });

  await page.goto('https://conduit.bondaracademy.com/');


  await page.waitForSelector('.tag-list');

  for (const tag of mockTags.tags) {
    const tagElement = page.locator(`.tag-list .tag-pill`, { hasText: tag });

    await expect(tagElement).toBeVisible();
  }
});

test('has title', async ({ page }) => {
  const title = await page.locator('.navbar-brand').textContent();
  expect(title).toBe("conduit");
});
