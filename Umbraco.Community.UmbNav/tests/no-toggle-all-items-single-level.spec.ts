import { expect  } from '@playwright/test';
import { test, ConstantHelper } from "@umbraco/playwright-testhelpers";

const contentName = 'Node Single';

test.beforeEach(async ({ umbracoUi }) => {
    await umbracoUi.goToBackOffice();
    await umbracoUi.login.enterEmail(ConstantHelper.testUserCredentials.email);
    await umbracoUi.login.enterPassword(ConstantHelper.testUserCredentials.password);
    await umbracoUi.login.clickLoginButton();
    await umbracoUi.login.goToSection(ConstantHelper.sections.content);
});

test.describe("UmbNav Do Not Show Toggle All Items When Single Level", () => {
  test('no-toggle-all-items-single-level', async ({ umbracoUi }) => {
    await umbracoUi.content.goToContentWithName(contentName);

    const toggleAllItemsButton = umbracoUi.page.locator('umbnav-property-editor-ui').getByLabel("Toggle All Items").first(); 
    await expect(toggleAllItemsButton).not.toBeVisible();
  });
});