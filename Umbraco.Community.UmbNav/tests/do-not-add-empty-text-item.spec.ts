import { expect  } from '@playwright/test';
import { test, ConstantHelper } from "@umbraco/playwright-testhelpers";

const contentName = 'Node';

test.beforeEach(async ({ umbracoUi }) => {
    await umbracoUi.goToBackOffice();
    await umbracoUi.login.enterEmail(ConstantHelper.testUserCredentials.email);
    await umbracoUi.login.enterPassword(ConstantHelper.testUserCredentials.password);
    await umbracoUi.login.clickLoginButton();
    await umbracoUi.login.goToSection(ConstantHelper.sections.content);
});

test.describe("UmbNav Do Not Add Empty Text Item", () => {
  test('do-not-add-empty-text-item', async ({ umbracoUi }) => {
    await umbracoUi.content.goToContentWithName(contentName);

    const addTextBtn = await umbracoUi.page.locator('umbnav-property-editor-ui').locator('#AddTextButton >> button');
    await addTextBtn.waitFor({ state: 'visible' });
    await addTextBtn.click();

    //await umbracoUi.page.getByRole('textbox', { name: 'content' }).fill('Test Text Item');
    await umbracoUi.page.getByRole('button', { name: 'Submit' }).click();

    const validationMessage = umbracoUi.page.locator('umb-form-validation-message').first(); 
    await validationMessage.waitFor({ state: 'visible' });

    await expect(validationMessage).toBeVisible();
  });
});