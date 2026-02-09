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
});

test.describe("UmbNav Custom Item Type Extension", () => {
    test('registered custom item type button is visible', async ({ umbracoUi }) => {
        await umbracoUi.content.goToContentWithName(contentName);

        const editor = umbracoUi.page.locator('umbnav-property-editor-ui');
        await editor.waitFor({ state: 'visible' });

        // Register a custom item type via the extension registry
        await umbracoUi.page.evaluate(async () => {
            const { UmbNavExtensionRegistry } = await import('/App_Plugins/UmbNav/dist/api.js');
            UmbNavExtensionRegistry.registerItemType({
                type: 'divider',
                label: 'Add Divider',
                icon: 'icon-split-alt',
                allowChildren: false,
                defaultValues: { itemType: 'Title', name: '---' }
            });
        });

        // Verify the custom button appears
        const dividerBtn = editor.getByRole('button', { name: 'Add Divider' });
        await expect(dividerBtn).toBeVisible();
    });

    test('clicking custom item type button adds item', async ({ umbracoUi }) => {
        await umbracoUi.content.goToContentWithName(contentName);

        const editor = umbracoUi.page.locator('umbnav-property-editor-ui');
        await editor.waitFor({ state: 'visible' });

        // Register a custom item type via the extension registry
        await umbracoUi.page.evaluate(async () => {
            const { UmbNavExtensionRegistry } = await import('/App_Plugins/UmbNav/dist/api.js');
            UmbNavExtensionRegistry.registerItemType({
                type: 'divider',
                label: 'Add Divider',
                icon: 'icon-split-alt',
                allowChildren: false,
                defaultValues: { itemType: 'Title', name: '---' }
            });
        });

        // Click the custom item type button
        const dividerBtn = editor.getByRole('button', { name: 'Add Divider' });
        await dividerBtn.waitFor({ state: 'visible' });
        await dividerBtn.click();

        // Verify the item was added with the default name
        await expect(umbracoUi.page.locator('umbnav-item div').filter({ hasText: '---' }).first()).toBeVisible();
    });

    test('unregistered custom item type button is removed', async ({ umbracoUi }) => {
        await umbracoUi.content.goToContentWithName(contentName);

        const editor = umbracoUi.page.locator('umbnav-property-editor-ui');
        await editor.waitFor({ state: 'visible' });

        // Register then unregister a custom item type
        await umbracoUi.page.evaluate(async () => {
            const { UmbNavExtensionRegistry } = await import('/App_Plugins/UmbNav/dist/api.js');
            UmbNavExtensionRegistry.registerItemType({
                type: 'divider',
                label: 'Add Divider',
                icon: 'icon-split-alt',
                allowChildren: false,
            });
        });

        const dividerBtn = editor.getByRole('button', { name: 'Add Divider' });
        await expect(dividerBtn).toBeVisible();

        // Unregister the item type
        await umbracoUi.page.evaluate(async () => {
            const { UmbNavExtensionRegistry } = await import('/App_Plugins/UmbNav/dist/api.js');
            UmbNavExtensionRegistry.unregisterItemType('divider');
        });

        await expect(dividerBtn).not.toBeVisible();
    });
});
