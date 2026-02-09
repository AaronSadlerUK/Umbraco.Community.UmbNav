import { expect  } from '@playwright/test';
import { test, ConstantHelper } from "@umbraco/playwright-testhelpers";

const contentName = 'Node';

test.beforeEach(async ({ umbracoUi }) => {
    await umbracoUi.goToBackOffice();
    await umbracoUi.login.enterEmail(ConstantHelper.testUserCredentials.email);
    await umbracoUi.login.enterPassword(ConstantHelper.testUserCredentials.password);
    await umbracoUi.login.clickLoginButton();
        const tab = umbracoUi.page.getByRole('tab', { name: 'Content' });
    await expect(tab).toBeVisible();
    await tab.click();
    // await umbracoUi.login.goToSection(ConstantHelper.sections.content);
});

test.describe("UmbNav Add Text Item", () => {
  test('add-text-item', async ({ umbracoUi }) => {
    await umbracoUi.content.goToContentWithName(contentName);

    const addTextBtn = await umbracoUi.page.locator('umbnav-property-editor-ui').locator('#AddTextButton >> button');
    await addTextBtn.waitFor({ state: 'visible' });
    await addTextBtn.click();

    await umbracoUi.page.locator('#input[name="name"]').fill('Test Text Item');
    await umbracoUi.page.locator('#button', { hasText: 'Submit' }).click();
    await expect(umbracoUi.page.locator('umbnav-item div').filter({ hasText: 'Test Text Item' }).first()).toBeVisible();
  });
});