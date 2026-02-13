using Umbraco.Community.UmbNav.Core.Extensions;
using Umbraco.Community.UmbNav.Core.Models;

namespace Umbraco.Community.UmbNav.Core.Tests.Extensions;

public class UmbNavItemExtensionsTests
{
    [Fact]
    public void GetName_WithoutCulture_ReturnsInvariantName()
    {
        var item = new UmbNavItem
        {
            Name = "Home",
            ItemType = UmbNavItemType.External
        };

        var result = item.GetName();

        Assert.Equal("Home", result);
    }

    [Fact]
    public void GetName_WithCultureButNoVariants_ReturnsInvariantName()
    {
        var item = new UmbNavItem
        {
            Name = "Home",
            ItemType = UmbNavItemType.External
        };

        var result = item.GetName("fr-FR");

        Assert.Equal("Home", result);
    }

    [Fact]
    public void GetName_WithCultureAndVariants_ReturnsVariantName()
    {
        var item = new UmbNavItem
        {
            Name = "Home",
            ItemType = UmbNavItemType.External,
            Variants = new UmbNavItemVariants
            {
                Name = new Dictionary<string, string>
                {
                    { "en-US", "Home" },
                    { "fr-FR", "Accueil" },
                    { "de-DE", "Startseite" }
                }
            }
        };

        var result = item.GetName("fr-FR");

        Assert.Equal("Accueil", result);
    }

    [Fact]
    public void GetName_WithNonExistentCulture_ReturnsInvariantName()
    {
        var item = new UmbNavItem
        {
            Name = "Home",
            ItemType = UmbNavItemType.External,
            Variants = new UmbNavItemVariants
            {
                Name = new Dictionary<string, string>
                {
                    { "en-US", "Home" },
                    { "fr-FR", "Accueil" }
                }
            }
        };

        var result = item.GetName("es-ES");

        Assert.Equal("Home", result);
    }

    [Fact]
    public void GetDescription_WithoutCulture_ReturnsInvariantDescription()
    {
        var item = new UmbNavItem
        {
            Name = "Home",
            Description = "Main page",
            ItemType = UmbNavItemType.External
        };

        var result = item.GetDescription();

        Assert.Equal("Main page", result);
    }

    [Fact]
    public void GetDescription_WithCultureAndVariants_ReturnsVariantDescription()
    {
        var item = new UmbNavItem
        {
            Name = "Home",
            Description = "Main page",
            ItemType = UmbNavItemType.External,
            Variants = new UmbNavItemVariants
            {
                Description = new Dictionary<string, string>
                {
                    { "en-US", "Main page" },
                    { "fr-FR", "Page principale" },
                    { "de-DE", "Hauptseite" }
                }
            }
        };

        var result = item.GetDescription("fr-FR");

        Assert.Equal("Page principale", result);
    }

    [Fact]
    public void GetDescription_WithNonExistentCulture_ReturnsInvariantDescription()
    {
        var item = new UmbNavItem
        {
            Name = "Home",
            Description = "Main page",
            ItemType = UmbNavItemType.External,
            Variants = new UmbNavItemVariants
            {
                Description = new Dictionary<string, string>
                {
                    { "en-US", "Main page" },
                    { "fr-FR", "Page principale" }
                }
            }
        };

        var result = item.GetDescription("es-ES");

        Assert.Equal("Main page", result);
    }

    [Fact]
    public void GetName_WithEmptyVariantString_FallsBackToInvariant()
    {
        var item = new UmbNavItem
        {
            Name = "Home",
            ItemType = UmbNavItemType.External,
            Variants = new UmbNavItemVariants
            {
                Name = new Dictionary<string, string>
                {
                    { "en-US", "Home" },
                    { "fr-FR", "" }  // Empty variant
                }
            }
        };

        var result = item.GetName("fr-FR");

        Assert.Equal("Home", result);
    }

    [Fact]
    public void GetDescription_WithNullInvariant_ReturnsNull()
    {
        var item = new UmbNavItem
        {
            Name = "Home",
            Description = null,
            ItemType = UmbNavItemType.External
        };

        var result = item.GetDescription("fr-FR");

        Assert.Null(result);
    }
}
