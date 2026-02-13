import { expect  } from '@playwright/test';
import { test, ConstantHelper } from "@umbraco/playwright-testhelpers";

const contentName = 'Node Single'; // Uses 'node1' document type where UmbNav is optional

test.beforeEach(async ({ umbracoUi }) => {
    await umbracoUi.goToBackOffice();
    await umbracoUi.login.enterEmail(ConstantHelper.testUserCredentials.email);
    await umbracoUi.login.enterPassword(ConstantHelper.testUserCredentials.password);
    await umbracoUi.login.clickLoginButton();
    const tab = umbracoUi.page.getByRole('tab', { name: 'Content' });
    await expect(tab).toBeVisible();
    await tab.click();
});

test.describe("UmbNav Optional Property", () => {
    test('optional property allows saving when empty', async ({ umbracoUi }) => {
        await umbracoUi.content.goToContentWithName(contentName);

        const editor = umbracoUi.page.locator('umbnav-property-editor-ui');
        await editor.waitFor({ state: 'visible' });

        // Ensure UmbNav has no items
        const items = editor.locator('umbnav-item');
        await expect(items).toHaveCount(0);

        // Save and publish with empty optional UmbNav
        const saveButton = umbracoUi.page.getByRole('button', { name: 'Save And Publish' });
        await saveButton.click();

        // Verify no mandatory validation error appears
        const validationMessage = umbracoUi.page.getByText('At least one menu item is required.');
        await expect(validationMessage).not.toBeVisible();

        // Verify save succeeded via success notification
        const successNotification = umbracoUi.page.locator('uui-toast-notification[color="positive"]');
        await successNotification.waitFor({ state: 'visible', timeout: 10000 });
        await expect(successNotification).toBeVisible();
    });
});
