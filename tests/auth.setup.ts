import { test as setup } from '@playwright/test';
import user from '../auth/user.json';
import fs from 'fs';

const authFile = './auth/user.json';

setup('authenticaion', async ({ request }) => {
    // auth with interface
    // await page.goto('https://conduit.bondaracademy.com/');

    // await page.getByText("Sign in").click();
    // await page.getByRole('textbox', { name: 'Email' }).fill('demidovich.fiml@gmail.com');
    // await page.getByRole('textbox', { name: 'Password' }).fill('Pasxarik1989!');
    // await page.getByRole('button', { name: 'Sign in' }).click();

    // await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags');

    // // save in state
    // await page.context().storageState({ path: authFile });

    // auth without interface
    const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
          "user":{"email":"demidovich.fiml@gmail.com","password":"Pasxarik1989!"}
        }
    });
    
    const responseBody = await response.json();
    const accessToken = responseBody.user.token;

    user.origins[0].localStorage[0].value = accessToken;
    fs.writeFileSync(authFile, JSON.stringify(user));

    process.env['ACCESS_TOKEN'] = accessToken;
});