# C# Unit Tests

UmbNav includes comprehensive unit tests for the backend services using xUnit and Moq.

## Test Project Structure

```
Umbraco.Community.UmbNav.Core.Tests/
├── Extensions/
│   └── UmbNavItemExtensionsTests.cs
├── Models/
│   └── UmbNavBuildOptionsTests.cs
├── Services/
│   └── UmbNavMenuBuilderServiceTests.cs
└── Umbraco.Community.UmbNav.Core.Tests.csproj
```

## Running Tests

### Command Line

```bash
# Run all tests
cd Umbraco.Community.UmbNav.Core.Tests
dotnet test

# Run with detailed output
dotnet test --verbosity normal

# Run with code coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test class
dotnet test --filter "FullyQualifiedName~UmbNavMenuBuilderServiceTests"

# Run specific test
dotnet test --filter "DisplayName~WithEmptyItems"
```

### Visual Studio

1. Open Test Explorer (Test → Test Explorer)
2. Click "Run All" or right-click specific tests
3. View results in the Test Explorer window

### VS Code

1. Install the C# Dev Kit extension
2. Open the Testing panel
3. Click run/debug buttons next to tests

## Test Examples

### Menu Builder Service Tests

Testing the core service that processes menu items:

```csharp
public class UmbNavMenuBuilderServiceTests
{
    private readonly Mock<IPublishedContentCache> _contentCacheMock;
    private readonly Mock<IPublishedMediaCache> _mediaCacheMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly Mock<IUmbracoContextAccessor> _umbracoContextAccessorMock;
    private readonly Mock<ILogger<UmbNavMenuBuilderService>> _loggerMock;
    private readonly UmbNavMenuBuilderService _service;

    public UmbNavMenuBuilderServiceTests()
    {
        _contentCacheMock = new Mock<IPublishedContentCache>();
        _mediaCacheMock = new Mock<IPublishedMediaCache>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _umbracoContextAccessorMock = new Mock<IUmbracoContextAccessor>();
        _loggerMock = new Mock<ILogger<UmbNavMenuBuilderService>>();

        _service = new UmbNavMenuBuilderService(
            _contentCacheMock.Object,
            _loggerMock.Object,
            _httpContextAccessorMock.Object,
            _umbracoContextAccessorMock.Object,
            _mediaCacheMock.Object);
    }

    [Fact]
    public void BuildMenu_WithEmptyItems_ReturnsEmptyCollection()
    {
        // Arrange
        var items = Enumerable.Empty<UmbNavItem>();

        // Act
        var result = _service.BuildMenu(items);

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public void BuildMenu_WithNullOptions_UsesDefaultOptions()
    {
        // Arrange
        var items = new List<UmbNavItem>
        {
            new() { Name = "Test", Description = "Desc", CustomClasses = "class1" }
        };

        // Act
        var result = _service.BuildMenu(items, null).ToList();

        // Assert
        Assert.Single(result);
        Assert.Equal("Desc", result[0].Description);
        Assert.Equal("class1", result[0].CustomClasses);
    }
}
```

### Testing Build Options

```csharp
[Fact]
public void BuildMenu_WithRemoveDescription_SetsDescriptionToNull()
{
    // Arrange
    var items = new List<UmbNavItem>
    {
        new() { Name = "Test", Description = "Some description" }
    };
    var options = new UmbNavBuildOptions { RemoveDescription = true };

    // Act
    var result = _service.BuildMenu(items, options).ToList();

    // Assert
    Assert.Single(result);
    Assert.Null(result[0].Description);
}

[Fact]
public void BuildMenu_WithMultipleOptions_AppliesAllOptions()
{
    // Arrange
    var items = new List<UmbNavItem>
    {
        new()
        {
            Name = "Test",
            Description = "Desc",
            CustomClasses = "class",
            Noopener = "noopener",
            Noreferrer = "noreferrer"
        }
    };
    var options = new UmbNavBuildOptions
    {
        RemoveDescription = true,
        RemoveCustomClasses = true,
        RemoveNoopener = true,
        RemoveNoreferrer = true
    };

    // Act
    var result = _service.BuildMenu(items, options).ToList();

    // Assert
    Assert.Single(result);
    Assert.Null(result[0].Description);
    Assert.Null(result[0].CustomClasses);
    Assert.Null(result[0].Noopener);
    Assert.Null(result[0].Noreferrer);
}
```

### Testing Max Depth

```csharp
[Fact]
public void BuildMenu_WithMaxDepth1_ExcludesAllChildren()
{
    // Arrange
    var items = new List<UmbNavItem>
    {
        new()
        {
            Name = "Level 0",
            Children = new List<UmbNavItem>
            {
                new() { Name = "Level 1" }
            }
        }
    };
    var options = new UmbNavBuildOptions { MaxDepth = 1 };

    // Act
    var result = _service.BuildMenu(items, options).ToList();

    // Assert
    Assert.Single(result);
    Assert.Null(result[0].Children);
}

[Fact]
public void BuildMenu_WithMaxDepth2_IncludesOnlyFirstLevelChildren()
{
    // Arrange
    var items = new List<UmbNavItem>
    {
        new()
        {
            Name = "Level 0",
            Children = new List<UmbNavItem>
            {
                new()
                {
                    Name = "Level 1",
                    Children = new List<UmbNavItem>
                    {
                        new() { Name = "Level 2" }
                    }
                }
            }
        }
    };
    var options = new UmbNavBuildOptions { MaxDepth = 2 };

    // Act
    var result = _service.BuildMenu(items, options).ToList();

    // Assert
    Assert.Single(result);
    Assert.NotNull(result[0].Children);
    Assert.Single(result[0].Children!);
    Assert.Null(result[0].Children!.First().Children);
}
```

### Testing Authentication-Based Visibility

```csharp
[Fact]
public void BuildMenu_WithHideLoggedIn_ExcludesItemWhenUserIsLoggedIn()
{
    // Arrange - Setup logged in user
    var httpContext = new DefaultHttpContext();
    var identity = new System.Security.Claims.ClaimsIdentity("test");
    httpContext.User = new System.Security.Claims.ClaimsPrincipal(identity);
    _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);

    var items = new List<UmbNavItem>
    {
        new() { Name = "Hidden when logged in", HideLoggedIn = true },
        new() { Name = "Always visible" }
    };

    // Act
    var result = _service.BuildMenu(items).ToList();

    // Assert
    Assert.Single(result);
    Assert.Equal("Always visible", result[0].Name);
}

[Fact]
public void BuildMenu_WithHideLoggedOut_ExcludesItemWhenUserIsNotLoggedIn()
{
    // Arrange - Setup no user
    _httpContextAccessorMock.Setup(x => x.HttpContext).Returns((HttpContext?)null);

    var items = new List<UmbNavItem>
    {
        new() { Name = "Hidden when logged out", HideLoggedOut = true },
        new() { Name = "Always visible" }
    };

    // Act
    var result = _service.BuildMenu(items).ToList();

    // Assert
    Assert.Single(result);
    Assert.Equal("Always visible", result[0].Name);
}
```

### Testing Content Resolution

```csharp
[Fact]
public void BuildMenu_WithContentKey_ExcludesItemWhenContentNotFound()
{
    // Arrange
    var contentKey = Guid.NewGuid();
    _contentCacheMock
        .Setup(x => x.GetById(contentKey))
        .Returns((IPublishedContent?)null);

    var items = new List<UmbNavItem>
    {
        new()
        {
            Name = "Content Item",
            ContentKey = contentKey,
            ItemType = UmbNavItemType.Document
        },
        new() { Name = "Text Item" }
    };

    // Act
    var result = _service.BuildMenu(items).ToList();

    // Assert
    Assert.Single(result);
    Assert.Equal("Text Item", result[0].Name);
}
```

### Testing Recursive Processing

```csharp
[Fact]
public void BuildMenu_ProcessesChildrenRecursively()
{
    // Arrange
    var items = new List<UmbNavItem>
    {
        new()
        {
            Name = "Level 0",
            Description = "L0 Desc",
            Children = new List<UmbNavItem>
            {
                new()
                {
                    Name = "Level 1",
                    Description = "L1 Desc",
                    Children = new List<UmbNavItem>
                    {
                        new() { Name = "Level 2", Description = "L2 Desc" }
                    }
                }
            }
        }
    };
    var options = new UmbNavBuildOptions { RemoveDescription = true };

    // Act
    var result = _service.BuildMenu(items, options).ToList();

    // Assert - All levels have null description
    Assert.Null(result[0].Description);
    Assert.Null(result[0].Children!.First().Description);
    Assert.Null(result[0].Children!.First().Children!.First().Description);
}
```

## Mocking Patterns

### Mocking Published Content

```csharp
private Mock<IPublishedContent> CreateMockContent(Guid key, string name)
{
    var mock = new Mock<IPublishedContent>();
    mock.Setup(x => x.Key).Returns(key);
    mock.Setup(x => x.Name).Returns(name);
    mock.Setup(x => x.Id).Returns(new Random().Next(1, 10000));
    return mock;
}

[Fact]
public void Test_WithMockedContent()
{
    var contentKey = Guid.NewGuid();
    var mockContent = CreateMockContent(contentKey, "Test Page");

    _contentCacheMock
        .Setup(x => x.GetById(contentKey))
        .Returns(mockContent.Object);

    // ... test logic
}
```

### Mocking HTTP Context

```csharp
private void SetupLoggedInUser(string role = "member")
{
    var httpContext = new DefaultHttpContext();
    var claims = new List<Claim>
    {
        new(ClaimTypes.Name, "test@example.com"),
        new(ClaimTypes.Role, role)
    };
    var identity = new ClaimsIdentity(claims, "test");
    httpContext.User = new ClaimsPrincipal(identity);

    _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);
}

private void SetupAnonymousUser()
{
    _httpContextAccessorMock.Setup(x => x.HttpContext).Returns((HttpContext?)null);
}
```

## Testing Custom Extensions

When you create custom services, test them thoroughly:

```csharp
public class CustomMenuBuilderServiceTests
{
    private readonly Mock<IAnalyticsService> _analyticsMock;
    private readonly CustomMenuBuilderService _service;

    public CustomMenuBuilderServiceTests()
    {
        // ... setup mocks

        _analyticsMock = new Mock<IAnalyticsService>();

        _service = new CustomMenuBuilderService(
            _contentCacheMock.Object,
            _loggerMock.Object,
            _httpContextAccessorMock.Object,
            _umbracoContextAccessorMock.Object,
            _mediaCacheMock.Object,
            _analyticsMock.Object);
    }

    [Fact]
    public void ShouldIncludeItem_WithAdminOnlyClass_WhenNotAdmin_ReturnsFalse()
    {
        // Arrange
        SetupLoggedInUser("member"); // Not admin

        var items = new List<UmbNavItem>
        {
            new() { Name = "Admin Page", CustomClasses = "admin-only" }
        };

        // Act
        var result = _service.BuildMenu(items).ToList();

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public void ShouldIncludeItem_WithAdminOnlyClass_WhenAdmin_ReturnsTrue()
    {
        // Arrange
        SetupLoggedInUser("admin");

        var items = new List<UmbNavItem>
        {
            new() { Name = "Admin Page", CustomClasses = "admin-only" }
        };

        // Act
        var result = _service.BuildMenu(items).ToList();

        // Assert
        Assert.Single(result);
    }
}
```

## Test Data Builders

Create reusable test data builders:

```csharp
public static class TestDataBuilders
{
    public static UmbNavItem CreateItem(
        string name = "Test Item",
        UmbNavItemType itemType = UmbNavItemType.Document,
        Guid? key = null,
        string? description = null,
        string? customClasses = null,
        IEnumerable<UmbNavItem>? children = null)
    {
        return new UmbNavItem
        {
            Key = key ?? Guid.NewGuid(),
            Name = name,
            ItemType = itemType,
            Description = description,
            CustomClasses = customClasses,
            Children = children?.ToList()
        };
    }

    public static List<UmbNavItem> CreateNestedItems(int depth, int childrenPerLevel = 2)
    {
        if (depth <= 0) return new List<UmbNavItem>();

        var items = new List<UmbNavItem>();
        for (int i = 0; i < childrenPerLevel; i++)
        {
            items.Add(CreateItem(
                name: $"Item L0-{i}",
                children: depth > 1 ? CreateChildItems(depth - 1, 1, childrenPerLevel) : null
            ));
        }
        return items;
    }

    private static List<UmbNavItem> CreateChildItems(int depth, int level, int count)
    {
        var items = new List<UmbNavItem>();
        for (int i = 0; i < count; i++)
        {
            items.Add(CreateItem(
                name: $"Item L{level}-{i}",
                children: depth > 1 ? CreateChildItems(depth - 1, level + 1, count) : null
            ));
        }
        return items;
    }
}
```

## Best Practices

1. **One assertion per test** (when practical)
2. **Descriptive test names** - `Method_Scenario_ExpectedResult`
3. **Arrange-Act-Assert pattern** - Clear structure
4. **Test edge cases** - null, empty, boundary values
5. **Keep tests independent** - No shared mutable state
6. **Use test data builders** - Avoid repetitive setup code

## Next Steps

- [Playwright Tests](playwright.md) - E2E testing
- [Testing Overview](overview.md) - General testing info
- [Contributing](../reference/contributing.md) - Contributing tests
