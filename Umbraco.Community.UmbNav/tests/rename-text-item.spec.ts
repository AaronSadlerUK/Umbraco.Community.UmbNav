import { expect  } from '@playwright/test';
import { test, ConstantHelper } from "@umbraco/playwright-testhelpers";

const contentName = 'Text Item with Link Children';

test.beforeEach(async ({ umbracoUi }) => {
    await umbracoUi.goToBackOffice();
    await umbracoUi.login.enterEmail(ConstantHelper.testUserCredentials.email);
    await umbracoUi.login.enterPassword(ConstantHelper.testUserCredentials.password);
    await umbracoUi.login.clickLoginButton();
    // await new Promise(resolve => setTimeout(resolve, 5000));
    const tab = umbracoUi.page.getByRole('tab', { name: 'Content' });
    await expect(tab).toBeVisible();
    await tab.click();
    // await umbracoUi.login.goToSection(ConstantHelper.sections.content);
});

test.describe("UmbNav Rename Text Item", () => {
  test('rename-text-item', async ({ umbracoUi }) => {
    await umbracoUi.content.goToContentWithName(contentName);

    await umbracoUi.page.locator('uui-button:nth-child(4) > uui-icon > svg').first().click();
    await umbracoUi.page.getByRole('textbox', { name: 'content' }).fill('Test Text Item Rename');
    await umbracoUi.page.getByRole('button', { name: 'Submit' }).click();
    await umbracoUi.page.locator('#arrow > uui-symbol-expand > svg').first().click();
    await expect(umbracoUi.page.locator('div').filter({ hasText: 'Home 5 /us/' }).nth(5)).toBeVisible();
  });
});