using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Web;
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Community.UmbNav.Core.Services;

namespace Umbraco.Community.UmbNav.Core.Tests.Services;

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
        var items = Enumerable.Empty<UmbNavItem>();

        var result = _service.BuildMenu(items);

        Assert.Empty(result);
    }

    [Fact]
    public void BuildMenu_WithNullOptions_UsesDefaultOptions()
    {
        var items = new List<UmbNavItem>
        {
            new() { Name = "Test", Description = "Desc", CustomClasses = "class1" }
        };

        var result = _service.BuildMenu(items, null).ToList();

        Assert.Single(result);
        // Default options don't remove anything
        Assert.Equal("Desc", result[0].Description);
        Assert.Equal("class1", result[0].CustomClasses);
    }

    [Fact]
    public void BuildMenu_WithRemoveDescription_SetsDescriptionToNull()
    {
        var items = new List<UmbNavItem>
        {
            new() { Name = "Test", Description = "Some description" }
        };
        var options = new UmbNavBuildOptions { RemoveDescription = true };

        var result = _service.BuildMenu(items, options).ToList();

        Assert.Single(result);
        Assert.Null(result[0].Description);
    }

    [Fact]
    public void BuildMenu_WithRemoveCustomClasses_SetsCustomClassesToNull()
    {
        var items = new List<UmbNavItem>
        {
            new() { Name = "Test", CustomClasses = "my-class other-class" }
        };
        var options = new UmbNavBuildOptions { RemoveCustomClasses = true };

        var result = _service.BuildMenu(items, options).ToList();

        Assert.Single(result);
        Assert.Null(result[0].CustomClasses);
    }

    [Fact]
    public void BuildMenu_WithRemoveNoopener_SetsNoopenerToNull()
    {
        var items = new List<UmbNavItem>
        {
            new() { Name = "Test", Noopener = "noopener" }
        };
        var options = new UmbNavBuildOptions { RemoveNoopener = true };

        var result = _service.BuildMenu(items, options).ToList();

        Assert.Single(result);
        Assert.Null(result[0].Noopener);
    }

    [Fact]
    public void BuildMenu_WithRemoveNoreferrer_SetsNoreferrerToNull()
    {
        var items = new List<UmbNavItem>
        {
            new() { Name = "Test", Noreferrer = "noreferrer" }
        };
        var options = new UmbNavBuildOptions { RemoveNoreferrer = true };

        var result = _service.BuildMenu(items, options).ToList();

        Assert.Single(result);
        Assert.Null(result[0].Noreferrer);
    }

    [Fact]
    public void BuildMenu_WithRemoveImages_SetsImagePropertiesToNull()
    {
        var items = new List<UmbNavItem>
        {
            new()
            {
                Name = "Test",
                ImageArray = new[] { new ImageItem { Key = Guid.NewGuid() } }
            }
        };
        var options = new UmbNavBuildOptions { RemoveImages = true };

        var result = _service.BuildMenu(items, options).ToList();

        Assert.Single(result);
        Assert.Null(result[0].Image);
        Assert.Null(result[0].ImageArray);
    }

    [Fact]
    public void BuildMenu_WithMultipleOptions_AppliesAllOptions()
    {
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

        var result = _service.BuildMenu(items, options).ToList();

        Assert.Single(result);
        Assert.Null(result[0].Description);
        Assert.Null(result[0].CustomClasses);
        Assert.Null(result[0].Noopener);
        Assert.Null(result[0].Noreferrer);
    }

    [Fact]
    public void BuildMenu_SetsLevelOnItems()
    {
        var items = new List<UmbNavItem>
        {
            new() { Name = "Parent", Children = new List<UmbNavItem>
                {
                    new() { Name = "Child" }
                }
            }
        };

        var result = _service.BuildMenu(items).ToList();

        Assert.Equal(0, result[0].Level);
        Assert.Equal(1, result[0].Children!.First().Level);
    }

    [Fact]
    public void BuildMenu_WithHideLoggedIn_ExcludesItemWhenUserIsLoggedIn()
    {
        // Setup logged in user
        var httpContext = new DefaultHttpContext();
        var identity = new System.Security.Claims.ClaimsIdentity("test");
        httpContext.User = new System.Security.Claims.ClaimsPrincipal(identity);
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);

        var items = new List<UmbNavItem>
        {
            new() { Name = "Hidden when logged in", HideLoggedIn = true },
            new() { Name = "Always visible" }
        };

        var result = _service.BuildMenu(items).ToList();

        Assert.Single(result);
        Assert.Equal("Always visible", result[0].Name);
    }

    [Fact]
    public void BuildMenu_WithHideLoggedOut_ExcludesItemWhenUserIsNotLoggedIn()
    {
        // Setup no user / not logged in
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns((HttpContext?)null);

        var items = new List<UmbNavItem>
        {
            new() { Name = "Hidden when logged out", HideLoggedOut = true },
            new() { Name = "Always visible" }
        };

        var result = _service.BuildMenu(items).ToList();

        Assert.Single(result);
        Assert.Equal("Always visible", result[0].Name);
    }

    [Fact]
    public void BuildMenu_WithContentKey_ExcludesItemWhenContentNotFound()
    {
        var contentKey = Guid.NewGuid();
        _contentCacheMock.Setup(x => x.GetById(contentKey)).Returns((IPublishedContent?)null);

        var items = new List<UmbNavItem>
        {
            new() { Name = "Content Item", ContentKey = contentKey, ItemType = UmbNavItemType.Document },
            new() { Name = "Text Item" }
        };

        var result = _service.BuildMenu(items).ToList();

        Assert.Single(result);
        Assert.Equal("Text Item", result[0].Name);
    }

    [Fact]
    public void BuildMenu_ProcessesChildrenRecursively()
    {
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

        var result = _service.BuildMenu(items, options).ToList();

        Assert.Null(result[0].Description);
        Assert.Null(result[0].Children!.First().Description);
        Assert.Null(result[0].Children!.First().Children!.First().Description);
    }

    [Fact]
    public void BuildMenu_WithNoChildren_SetsChildrenToNull()
    {
        var items = new List<UmbNavItem>
        {
            new() { Name = "Test", Children = new List<UmbNavItem>() }
        };

        var result = _service.BuildMenu(items).ToList();

        Assert.Null(result[0].Children);
    }

    [Fact]
    public void BuildMenu_WithMaxDepth1_ExcludesAllChildren()
    {
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

        var result = _service.BuildMenu(items, options).ToList();

        Assert.Single(result);
        Assert.Null(result[0].Children);
    }

    [Fact]
    public void BuildMenu_WithMaxDepth2_IncludesOnlyFirstLevelChildren()
    {
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

        var result = _service.BuildMenu(items, options).ToList();

        Assert.Single(result);
        Assert.NotNull(result[0].Children);
        Assert.Single(result[0].Children!);
        Assert.Null(result[0].Children!.First().Children);
    }

    [Fact]
    public void BuildMenu_WithMaxDepth0_IncludesAllLevels()
    {
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
        var options = new UmbNavBuildOptions { MaxDepth = 0 };

        var result = _service.BuildMenu(items, options).ToList();

        Assert.Single(result);
        Assert.NotNull(result[0].Children);
        Assert.NotNull(result[0].Children!.First().Children);
        Assert.Equal("Level 2", result[0].Children!.First().Children!.First().Name);
    }
}
