import { expect  } from '@playwright/test';
import { test, ConstantHelper } from "@umbraco/playwright-testhelpers";

const contentName = 'Node No Text Items';

test.beforeEach(async ({ umbracoUi }) => {
    await umbracoUi.goToBackOffice();
    await umbracoUi.login.enterEmail(ConstantHelper.testUserCredentials.email);
    await umbracoUi.login.enterPassword(ConstantHelper.testUserCredentials.password);
    await umbracoUi.login.clickLoginButton();
    await umbracoUi.login.goToSection(ConstantHelper.sections.content);
});

test.describe("UmbNav Do Not Show Add Text Item Button", () => {
  test('no-text-items', async ({ umbracoUi }) => {
    await umbracoUi.content.goToContentWithName(contentName);

    const addTextItemButton = umbracoUi.page.locator('umbnav-property-editor-ui').getByLabel("Add Text Item").first(); 
    await expect(addTextItemButton).not.toBeVisible();
  });
});