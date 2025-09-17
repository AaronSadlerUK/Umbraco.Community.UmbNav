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

test.describe("UmbNav Add Inline Content Item", () => {
  test('add-inline-content-item', async ({ umbracoUi }) => {
        await umbracoUi.content.goToContentWithName(contentName);
        
        const addTextBtn = await umbracoUi.page.locator('umbnav-property-editor-ui').locator('#AddLinkButton >> button');
        await addTextBtn.waitFor({ state: 'visible' });
        await addTextBtn.click();
    
        await umbracoUi.page.getByRole('button', { name: 'Content', exact: true }).click();
        await umbracoUi.page.locator('#container').getByText('Home').click();
        await umbracoUi.page.getByRole('button', { name: 'Choose' }).click();
    
        await expect(umbracoUi.page.locator('umb-document-item-ref').filter({ hasText: 'Home' }).first()).toBeVisible();
    
        const addButton = await umbracoUi.page.getByRole('button', { name: 'Add', exact: true });
        await addButton.waitFor({ state: 'visible' });
        await addButton.click();

        const addTextBtn2 = await umbracoUi.page.locator('umbnav-property-editor-ui').locator('#AddLinkButton >> button');
        await addTextBtn2.waitFor({ state: 'visible' });
        await addTextBtn2.click();
    
        await umbracoUi.page.getByRole('button', { name: 'Content', exact: true }).click();
        await umbracoUi.page.locator('#container').getByText('Test').click();
        await umbracoUi.page.getByRole('button', { name: 'Choose' }).click();
    
        await expect(umbracoUi.page.locator('umb-document-item-ref').filter({ hasText: 'Test' }).first()).toBeVisible();
        const addButton2 = await umbracoUi.page.getByRole('button', { name: 'Add', exact: true });
        await addButton2.waitFor({ state: 'visible' });
        await addButton2.click();

        await umbracoUi.page.getByRole('button', { name: 'create new element' }).nth(1).click();
        await umbracoUi.page.getByRole('button', { name: 'Content', exact: true }).click();
        await umbracoUi.page.locator('#container').getByText('Node Single').click();
        await umbracoUi.page.getByRole('button', { name: 'Choose' }).click();

        await expect(umbracoUi.page.locator('umb-document-item-ref').filter({ hasText: 'Node Single' }).first()).toBeVisible();
        const addButton3 = await umbracoUi.page.getByRole('button', { name: 'Add', exact: true });
        await addButton3.waitFor({ state: 'visible' });
        await addButton3.click();

        await expect(umbracoUi.page.locator('umbnav-item:nth-child(4)').filter({ hasText: 'Node Single' }).first()).toBeVisible();
  });
});