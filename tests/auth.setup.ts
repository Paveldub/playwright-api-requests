import { test as setup } from '@playwright/test';

const authFile = './auth/user.json';

setup('authenticaion', async ({ page }) => {
    await page.goto('https://conduit.bondaracademy.com/');

    await page.getByText("Sign in").click();
    await page.getByRole('textbox', { name: 'Email' }).fill('demidovich.fiml@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Pasxarik1989!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags');

    // save in state
    await page.context().storageState({ path: authFile });
});