# Contributing

Thank you for your interest in contributing to UmbNav! This guide will help you get started.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels.

## Ways to Contribute

### Report Bugs

Found a bug? [Open an issue](https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav/issues/new) with:

- UmbNav version
- Umbraco version
- .NET version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### Suggest Features

Have an idea? [Open a feature request](https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav/issues/new) describing:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### Submit Code

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Development Setup

### Prerequisites

- .NET 10 SDK
- Node.js 23+
- Visual Studio 2022 or VS Code
- SQL Server (LocalDB or full)

### Clone and Build

```bash
# Clone the repository
git clone https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav.git
cd Umbraco.Community.UmbNav

# Restore .NET packages
dotnet restore

# Install npm packages
cd Umbraco.Community.UmbNav
npm install

# Build frontend
npm run build

# Build backend
cd ..
dotnet build
```

### Running the Test Site

```bash
# Start the test site
dotnet run --project TestSite.V17
```

Navigate to `https://localhost:44302` and complete Umbraco installation.

### Frontend Development

```bash
cd Umbraco.Community.UmbNav

# Watch mode for development
npm run watch

# Production build
npm run build

# Type checking
npm run typecheck
```

### Running Tests

```bash
# C# unit tests
dotnet test

# Playwright E2E tests
cd Umbraco.Community.UmbNav
npx playwright test

# Headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

## Project Structure

```
Umbraco.Community.UmbNav/
├── Umbraco.Community.UmbNav/        # Frontend package
│   ├── src/
│   │   ├── components/              # Lit web components
│   │   ├── modals/                  # Modal dialogs
│   │   ├── extensions/              # Extension system
│   │   ├── localization/            # i18n files
│   │   └── tokens/                  # Shared types
│   ├── tests/                       # Playwright tests
│   └── wwwroot/                     # Compiled assets
│
├── Umbraco.Community.UmbNav.Core/   # Backend package
│   ├── Models/                      # Data models
│   ├── Services/                    # Business logic
│   ├── TagHelpers/                  # Razor helpers
│   ├── Converters/                  # Value converters
│   └── Extensions/                  # Extension methods
│
├── TestSite.V17/                    # Development site
└── Docs/                            # Documentation
```

## Coding Standards

### C# Guidelines

- Follow [Microsoft C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- Use meaningful variable and method names
- Add XML documentation for public APIs
- Write unit tests for new functionality

```csharp
/// <summary>
/// Builds a processed menu from raw UmbNav items.
/// </summary>
/// <param name="items">The raw menu items.</param>
/// <param name="options">Build options.</param>
/// <returns>Processed menu items ready for rendering.</returns>
public IEnumerable<UmbNavItem> BuildMenu(
    IEnumerable<UmbNavItem>? items,
    UmbNavBuildOptions? options = null)
{
    // Implementation
}
```

### TypeScript Guidelines

- Use TypeScript strict mode
- Export types and interfaces
- Use Lit decorators for components
- Follow Umbraco backoffice patterns

```typescript
@customElement('my-component')
export class MyComponent extends UmbElementMixin(LitElement) {
    @property({ type: String })
    myProperty: string = '';

    override render() {
        return html`<div>${this.myProperty}</div>`;
    }
}
```

### Git Commit Messages

Use clear, descriptive commit messages:

```
feat: Add custom toolbar action support

- Add UmbNavToolbarAction interface
- Implement extension registry
- Add documentation

Closes #123
```

Prefixes:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Build/tooling

## Pull Request Process

1. **Create a branch** from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Make changes** and commit with clear messages

3. **Push and create PR**:
   ```bash
   git push -u origin feature/my-feature
   ```

4. **Fill out PR template** with:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots if UI changes

5. **Address review feedback** promptly

6. **Merge** after approval (maintainers will merge)

## Testing Requirements

### Unit Tests

Add tests for new C# code:

```csharp
public class MyServiceTests
{
    [Fact]
    public void MyMethod_WithValidInput_ReturnsExpectedResult()
    {
        // Arrange
        var service = new MyService();

        // Act
        var result = service.MyMethod("input");

        // Assert
        Assert.Equal("expected", result);
    }
}
```

### E2E Tests

Add Playwright tests for UI changes:

```typescript
import { expect } from '@playwright/test';
import { test } from "@umbraco/playwright-testhelpers";

test.describe("My Feature", () => {
    test('should work correctly', async ({ umbracoUi }) => {
        // Test implementation
    });
});
```

## Documentation

Update documentation for:

- New features
- API changes
- Configuration options
- Breaking changes

Documentation lives in the `Docs/` folder and uses Markdown format.

## Release Process

Releases are handled by maintainers:

1. Merge to `develop` for pre-release testing
2. Create release branch when ready
3. Update version numbers
4. Merge to `main` for release
5. GitHub Actions publishes to NuGet

## Getting Help

- **Questions**: Open a [GitHub Discussion](https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav/discussions)
- **Bugs**: Open a [GitHub Issue](https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav/issues)
- **Discord**: Join the Umbraco Community Discord

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Maintainers

- **Aaron Sadler** - [@AaronSadlerUK](https://github.com/AaronSadlerUK)

Thank you for contributing to UmbNav!
