import { expect  } from '@playwright/test';
import { test, ConstantHelper } from "@umbraco/playwright-testhelpers";
test.use({
  ignoreHTTPSErrors: true
});

const contentName = 'Node';

test.beforeEach(async ({ umbracoUi }) => {
	await umbracoUi.goToBackOffice();
  await umbracoUi.login.enterEmail(ConstantHelper.testUserCredentials.email);
  await umbracoUi.login.enterPassword(ConstantHelper.testUserCredentials.password);
  await umbracoUi.login.clickLoginButton();
	await umbracoUi.login.goToSection(ConstantHelper.sections.content);
});

test.describe("UmbNav Add Text Item", () => {
  test('add-text-item', async ({ umbracoUi }) => {
    await umbracoUi.content.goToContentWithName(contentName);

    await umbracoUi.page.locator('umb-property-layout').filter({ hasText: 'Toggle All Items Add Text Item Add Link Item UmbNav *' }).getByLabel('Add Text Item').click();
    await umbracoUi.page.getByRole('textbox', { name: 'content' }).fill('Test Text Item');
    await umbracoUi.page.getByRole('button', { name: 'Submit' }).click();

    await expect(umbracoUi.page.locator('umbnav-item div').filter({ hasText: 'Test Text Item' }).first()).toBeVisible();
  });
});