import { expect  } from '@playwright/test';
import { test, ConstantHelper } from "@umbraco/playwright-testhelpers";

const contentName = 'Node'; // Uses 'node' document type where UmbNav is mandatory

test.beforeEach(async ({ umbracoUi }) => {
    await umbracoUi.goToBackOffice();
    await umbracoUi.login.enterEmail(ConstantHelper.testUserCredentials.email);
    await umbracoUi.login.enterPassword(ConstantHelper.testUserCredentials.password);
    await umbracoUi.login.clickLoginButton();
    const tab = umbracoUi.page.getByRole('tab', { name: 'Content' });
    await expect(tab).toBeVisible();
    await tab.click();
});

test.describe("UmbNav Mandatory Property", () => {
    test('mandatory property blocks saving when empty', async ({ umbracoUi }) => {
        await umbracoUi.content.goToContentWithName(contentName);

        const editor = umbracoUi.page.locator('umbnav-property-editor-ui');
        await editor.waitFor({ state: 'visible' });

        // Ensure UmbNav has no items
        const items = editor.locator('umbnav-item');
        await expect(items).toHaveCount(0);

        // Attempt to save and publish with empty mandatory UmbNav
        const saveButton = umbracoUi.page.getByRole('button', { name: 'Save And Publish' });
        await saveButton.click();

        // Verify validation message appears — the valueMissing validator should
        // surface "At least one menu item is required."
        const validationMessage = umbracoUi.page.getByText('At least one menu item is required.');
        await validationMessage.waitFor({ state: 'visible' });
        await expect(validationMessage).toBeVisible();
    });
});
