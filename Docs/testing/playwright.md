# Playwright E2E Tests

UmbNav uses Playwright for end-to-end testing of the backoffice user interface. These tests verify that editors can create, modify, and manage navigation items.

## Setup

### Prerequisites

- Node.js 18 or higher
- A running Umbraco instance with test content
- Test user credentials

### Installation

```bash
cd Umbraco.Community.UmbNav

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment Configuration

Create a `.env` file in the `Umbraco.Community.UmbNav` directory:

```env
UMBRACO_URL=https://localhost:44302
UMBRACO_EMAIL=test@example.com
UMBRACO_PASSWORD=your-password
```

## Running Tests

### All Tests

```bash
npx playwright test
```

### Specific Test File

```bash
npx playwright test add-content-item.spec.ts
```

### Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Debug Mode

```bash
npx playwright test --debug
```

### Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Generate Report

```bash
npx playwright show-report
```

## Test Structure

```
Umbraco.Community.UmbNav/
├── tests/
│   ├── add-content-item.spec.ts
│   ├── add-inline-content-item.spec.ts
│   ├── add-text-item.spec.ts
│   ├── do-not-add-empty-text-item.spec.ts
│   ├── no-text-items.spec.ts
│   ├── no-toggle-all-items-single-level.spec.ts
│   ├── rename-link-item.spec.ts
│   ├── rename-text-item.spec.ts
│   └── show-toggle-all-items-multi-level.spec.ts
├── playwright/
│   └── .auth/
│       └── user.json  (generated - stores auth state)
└── playwright.config.ts
```

## Test Examples

### Adding a Content Item

```typescript
import { expect } from '@playwright/test';
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

test.describe("UmbNav Add Content Item", () => {
    test('add-content-item', async ({ umbracoUi }) => {
        // Navigate to content
        await umbracoUi.content.goToContentWithName(contentName);

        // Click add button
        const addTextBtn = await umbracoUi.page.locator(
            'umbnav-property-editor-ui'
        ).locator('#AddLinkButton >> button');
        await addTextBtn.waitFor({ state: 'visible' });
        await addTextBtn.click();

        // Select content type
        await umbracoUi.page.getByRole('button', { name: 'Content', exact: true }).click();

        // Select a content item
        await umbracoUi.page.locator('#container').getByText('Home').click();
        await umbracoUi.page.getByRole('button', { name: 'Choose' }).click();

        // Verify selection
        await expect(
            umbracoUi.page.locator('umb-document-item-ref').filter({ hasText: 'Home' }).first()
        ).toBeVisible();

        // Submit
        const addButton = await umbracoUi.page.getByRole('button', { name: 'Add', exact: true });
        await addButton.waitFor({ state: 'visible' });
        await addButton.click();

        // Verify item was added
        await expect(
            umbracoUi.page.locator('umbnav-item div').filter({ hasText: 'Home' }).first()
        ).toBeVisible();
    });
});
```

### Validation Test

```typescript
test.describe("UmbNav Validation", () => {
    test('do-not-add-empty-text-item', async ({ umbracoUi }) => {
        await umbracoUi.content.goToContentWithName(contentName);

        // Click add button
        const addBtn = umbracoUi.page.locator('umbnav-property-editor-ui #AddTextButton >> button');
        await addBtn.waitFor({ state: 'visible' });
        await addBtn.click();

        // Try to submit empty form
        const addButton = umbracoUi.page.getByRole('button', { name: 'Add', exact: true });
        await addButton.waitFor({ state: 'visible' });
        await addButton.click();

        // Verify validation message appears
        await expect(
            umbracoUi.page.getByText('Please enter a title for the text item.')
        ).toBeVisible();
    });
});
```

### Configuration-Based Test

```typescript
test.describe("UmbNav Configuration", () => {
    test('no-text-items-when-disabled', async ({ umbracoUi }) => {
        await umbracoUi.content.goToContentWithName('NodeWithNoTextItems');

        // Verify text item button is not present
        const addTextBtn = umbracoUi.page.locator(
            'umbnav-property-editor-ui #AddTextButton >> button'
        );

        await expect(addTextBtn).not.toBeVisible();
    });

    test('show-toggle-all-when-multi-level', async ({ umbracoUi }) => {
        await umbracoUi.content.goToContentWithName('NodeWithMultiLevel');

        // Add some nested items first...

        // Verify toggle all button appears
        const toggleAllBtn = umbracoUi.page.locator(
            'umbnav-property-editor-ui #ToggleAllButton >> button'
        );

        await expect(toggleAllBtn).toBeVisible();
    });
});
```

## Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';
import * as path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        trace: 'on-first-retry',
        ignoreHTTPSErrors: true
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
});
```

## Using Umbraco Test Helpers

UmbNav tests use `@umbraco/playwright-testhelpers` for common operations:

```typescript
import { test, ConstantHelper } from "@umbraco/playwright-testhelpers";

// Login
await umbracoUi.login.enterEmail(ConstantHelper.testUserCredentials.email);
await umbracoUi.login.enterPassword(ConstantHelper.testUserCredentials.password);
await umbracoUi.login.clickLoginButton();

// Navigate to content
await umbracoUi.content.goToContentWithName('NodeName');

// Use page locator for custom elements
await umbracoUi.page.locator('umbnav-item').click();
```

## Selectors for UmbNav Components

### Main Property Editor

```typescript
umbracoUi.page.locator('umbnav-property-editor-ui')
```

### Add Buttons

```typescript
// Add link button
umbracoUi.page.locator('umbnav-property-editor-ui #AddLinkButton >> button')

// Add text button
umbracoUi.page.locator('umbnav-property-editor-ui #AddTextButton >> button')
```

### Menu Items

```typescript
// All items
umbracoUi.page.locator('umbnav-item')

// Item by name
umbracoUi.page.locator('umbnav-item div').filter({ hasText: 'ItemName' })

// Item toolbar
umbracoUi.page.locator('umbnav-item #buttons')
```

### Modals

```typescript
// Modal dialog
umbracoUi.page.locator('umb-modal-dialog')

// Submit button
umbracoUi.page.getByRole('button', { name: 'Add', exact: true })

// Cancel button
umbracoUi.page.getByRole('button', { name: 'Cancel' })
```

## Writing New Tests

### Test Template

```typescript
import { expect } from '@playwright/test';
import { test, ConstantHelper } from "@umbraco/playwright-testhelpers";

const contentName = 'TestNode';

test.beforeEach(async ({ umbracoUi }) => {
    // Login
    await umbracoUi.goToBackOffice();
    await umbracoUi.login.enterEmail(ConstantHelper.testUserCredentials.email);
    await umbracoUi.login.enterPassword(ConstantHelper.testUserCredentials.password);
    await umbracoUi.login.clickLoginButton();

    // Navigate to content section
    const tab = umbracoUi.page.getByRole('tab', { name: 'Content' });
    await expect(tab).toBeVisible();
    await tab.click();
});

test.describe("Feature Category", () => {
    test('descriptive-test-name', async ({ umbracoUi }) => {
        // Arrange - Navigate to content
        await umbracoUi.content.goToContentWithName(contentName);

        // Act - Perform actions
        // ...

        // Assert - Verify results
        await expect(/* locator */).toBeVisible();
    });
});
```

### Best Practices

1. **Use descriptive test names** - Kebab-case for files, descriptive for tests
2. **Wait for elements** - Use `waitFor()` before interactions
3. **Use exact matches** - `{ name: 'Add', exact: true }` avoids ambiguity
4. **Test one thing** - Each test should verify one behavior
5. **Clean up** - Tests shouldn't leave side effects
6. **Use page object pattern** - Extract common selectors

## Debugging

### Debug Mode

```bash
npx playwright test --debug
```

### Trace Viewer

```bash
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Screenshots

```typescript
test('my test', async ({ umbracoUi }) => {
    await umbracoUi.page.screenshot({ path: 'screenshot.png' });
});
```

### Videos

In `playwright.config.ts`:

```typescript
use: {
    video: 'on-first-retry'
}
```

## CI Integration

Tests are designed to run in CI environments:

```yaml
- name: Run Playwright tests
  run: npx playwright test
  working-directory: Umbraco.Community.UmbNav
  env:
    CI: true
```

In CI mode:
- `forbidOnly: true` - Fails if `test.only` is present
- `retries: 2` - Retries flaky tests
- `workers: 1` - Runs sequentially to avoid conflicts

## Next Steps

- [Unit Tests](unit-tests.md) - C# testing
- [Testing Overview](overview.md) - General testing info
- [Contributing](../reference/contributing.md) - Contributing tests
