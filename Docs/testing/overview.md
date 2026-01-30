# Testing Overview

UmbNav includes comprehensive testing infrastructure to ensure reliability and help you test your own extensions.

## Test Types

UmbNav uses two types of tests:

| Type | Framework | Location | Purpose |
|------|-----------|----------|---------|
| Unit Tests | xUnit + Moq | `Umbraco.Community.UmbNav.Core.Tests/` | Backend C# logic |
| E2E Tests | Playwright | `Umbraco.Community.UmbNav/tests/` | Backoffice UI |

## Test Coverage

### Unit Tests (C#)

The C# unit tests cover:

- **UmbNavMenuBuilderService** - Menu processing logic
  - Item filtering
  - Content resolution
  - Build options application
  - Child processing
  - Active state detection
  - Authentication-based visibility

- **UmbNavBuildOptions** - Options behavior
  - Default values
  - Property removal
  - Depth limiting

- **UmbNavItemExtensions** - Extension methods
  - URL generation
  - Active state checking
  - HTML generation

### E2E Tests (Playwright)

The Playwright tests cover:

- **Adding Items**
  - Add content items
  - Add link items
  - Add text items
  - Inline item creation

- **Editing Items**
  - Rename items
  - Modify settings

- **Validation**
  - Empty text item validation
  - Required field validation

- **UI Features**
  - Toggle all button visibility
  - Text items configuration

## Running Tests

### Unit Tests

```bash
# Run all unit tests
cd Umbraco.Community.UmbNav.Core.Tests
dotnet test

# Run with verbose output
dotnet test --verbosity normal

# Run specific test class
dotnet test --filter "FullyQualifiedName~UmbNavMenuBuilderServiceTests"

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### E2E Tests

```bash
# Install Playwright browsers
cd Umbraco.Community.UmbNav
npx playwright install

# Run all E2E tests
npx playwright test

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test add-content-item.spec.ts

# Generate HTML report
npx playwright show-report
```

## Prerequisites

### For Unit Tests

- .NET 10 SDK
- Test dependencies (automatically restored):
  - xUnit
  - Moq
  - Microsoft.NET.Test.Sdk

### For E2E Tests

- Node.js 18+
- Playwright browsers (installed via `npx playwright install`)
- Running Umbraco instance with test content
- Environment variables:
  - Test user credentials (in `.env` file)

## Test Configuration

### Unit Test Project

The test project references:

```xml
<ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.*" />
    <PackageReference Include="xunit" Version="2.*" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.*" />
    <PackageReference Include="Moq" Version="4.*" />
</ItemGroup>

<ItemGroup>
    <ProjectReference Include="..\Umbraco.Community.UmbNav.Core\Umbraco.Community.UmbNav.Core.csproj" />
</ItemGroup>
```

### Playwright Configuration

`playwright.config.ts`:

```typescript
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
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } }
    ]
});
```

## Writing Tests

### Unit Test Pattern

```csharp
public class MyServiceTests
{
    private readonly Mock<IDependency> _dependencyMock;
    private readonly MyService _service;

    public MyServiceTests()
    {
        _dependencyMock = new Mock<IDependency>();
        _service = new MyService(_dependencyMock.Object);
    }

    [Fact]
    public void MethodName_Scenario_ExpectedResult()
    {
        // Arrange
        var input = CreateTestInput();

        // Act
        var result = _service.Method(input);

        // Assert
        Assert.NotNull(result);
    }
}
```

### E2E Test Pattern

```typescript
import { expect } from '@playwright/test';
import { test, ConstantHelper } from "@umbraco/playwright-testhelpers";

test.beforeEach(async ({ umbracoUi }) => {
    await umbracoUi.goToBackOffice();
    await umbracoUi.login.enterEmail(ConstantHelper.testUserCredentials.email);
    await umbracoUi.login.enterPassword(ConstantHelper.testUserCredentials.password);
    await umbracoUi.login.clickLoginButton();
});

test.describe("Feature Name", () => {
    test('test-case-name', async ({ umbracoUi }) => {
        // Navigate
        await umbracoUi.content.goToContentWithName('NodeName');

        // Interact
        await umbracoUi.page.locator('selector').click();

        // Assert
        await expect(umbracoUi.page.locator('result')).toBeVisible();
    });
});
```

## CI/CD Integration

Tests can run in GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'
      - run: dotnet test Umbraco.Community.UmbNav.Core.Tests

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
        working-directory: Umbraco.Community.UmbNav
      - run: npx playwright install --with-deps
        working-directory: Umbraco.Community.UmbNav
      - run: npx playwright test
        working-directory: Umbraco.Community.UmbNav
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Use descriptive names** - `MethodName_Scenario_ExpectedResult`
3. **Keep tests independent** - Each test should be runnable in isolation
4. **Mock external dependencies** - Use Moq for services, caches, etc.
5. **Test edge cases** - Null inputs, empty collections, boundary values
6. **Use test data builders** - Create reusable test data creation methods

## Next Steps

- [Unit Tests](unit-tests.md) - C# testing details
- [Playwright Tests](playwright.md) - E2E testing details
- [Contributing](../reference/contributing.md) - Contributing guidelines
