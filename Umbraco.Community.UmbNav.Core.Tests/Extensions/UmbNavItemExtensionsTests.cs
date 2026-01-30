using System.IO;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Html;
using Umbraco.Community.UmbNav.Core.Extensions;
using Umbraco.Community.UmbNav.Core.Models;

namespace Umbraco.Community.UmbNav.Core.Tests.Extensions;

public class UmbNavItemExtensionsTests
{
    private static string RenderHtml(IHtmlContent content)
    {
        using var writer = new StringWriter();
        content.WriteTo(writer, HtmlEncoder.Default);
        return writer.ToString();
    }

    [Fact]
    public void GetLinkHtml_WithTitleItemType_ReturnsSpanElement()
    {
        var item = new UmbNavItem
        {
            Name = "Test Label",
            ItemType = UmbNavItemType.Title
        };

        var result = RenderHtml(item.GetLinkHtml());

        Assert.Contains("<span", result);
        Assert.Contains("Test Label", result);
        Assert.DoesNotContain("href", result);
    }

    [Fact]
    public void GetLinkHtml_WithExternalItemType_ReturnsAnchorElement()
    {
        var item = new UmbNavItem
        {
            Name = "Test Link",
            ItemType = UmbNavItemType.External,
            Url = "/test-url"
        };

        var result = RenderHtml(item.GetLinkHtml());

        Assert.Contains("<a", result);
        Assert.Contains("href=\"/test-url\"", result);
        Assert.Contains("Test Link", result);
    }

    [Fact]
    public void GetLinkHtml_WithCustomLabelTagName_UsesCustomTag()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.Title
        };

        var result = RenderHtml(item.GetLinkHtml(labelTagName: "div"));

        Assert.Contains("<div", result);
    }

    [Fact]
    public void GetLinkHtml_WithCssClass_AddsCssClass()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External,
            Url = "/test"
        };

        var result = RenderHtml(item.GetLinkHtml(cssClass: "nav-link"));

        Assert.Contains("class=\"nav-link\"", result);
    }

    [Fact]
    public void GetLinkHtml_WithCustomClasses_AddsCustomClasses()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External,
            Url = "/test",
            CustomClasses = "custom-class"
        };

        var result = RenderHtml(item.GetLinkHtml());

        Assert.Contains("custom-class", result);
    }

    [Fact]
    public void GetLinkHtml_WithBothCssClassAndCustomClasses_AddsBoth()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External,
            Url = "/test",
            CustomClasses = "custom-class"
        };

        var result = RenderHtml(item.GetLinkHtml(cssClass: "nav-link"));

        Assert.Contains("nav-link", result);
        Assert.Contains("custom-class", result);
    }

    [Fact]
    public void GetLinkHtml_WithActiveClassAndIsActive_AddsActiveClass()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External,
            Url = "/test",
            IsActive = true
        };

        var result = RenderHtml(item.GetLinkHtml(activeClass: "active"));

        Assert.Contains("active", result);
    }

    [Fact]
    public void GetLinkHtml_WithActiveClassButNotActive_DoesNotAddActiveClass()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External,
            Url = "/test",
            IsActive = false
        };

        var result = RenderHtml(item.GetLinkHtml(activeClass: "active"));

        Assert.DoesNotContain("active", result);
    }

    [Fact]
    public void GetLinkHtml_WithId_AddsIdAttribute()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External,
            Url = "/test"
        };

        var result = RenderHtml(item.GetLinkHtml(id: "my-link"));

        Assert.Contains("id=\"my-link\"", result);
    }

    [Fact]
    public void GetLinkHtml_WithTarget_AddsTargetAttribute()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External,
            Url = "/test",
            Target = "_blank"
        };

        var result = RenderHtml(item.GetLinkHtml());

        Assert.Contains("target=\"_blank\"", result);
    }

    [Fact]
    public void GetLinkHtml_WithNoopener_AddsRelAttribute()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External,
            Url = "/test",
            Noopener = "noopener"
        };

        var result = RenderHtml(item.GetLinkHtml());

        Assert.Contains("rel=\"noopener\"", result);
    }

    [Fact]
    public void GetLinkHtml_WithNoreferrer_AddsRelAttribute()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External,
            Url = "/test",
            Noreferrer = "noreferrer"
        };

        var result = RenderHtml(item.GetLinkHtml());

        Assert.Contains("rel=\"noreferrer\"", result);
    }

    [Fact]
    public void GetLinkHtml_WithBothNoopenerAndNoreferrer_AddsCombinedRelAttribute()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External,
            Url = "/test",
            Noopener = "noopener",
            Noreferrer = "noreferrer"
        };

        var result = RenderHtml(item.GetLinkHtml());

        Assert.Contains("rel=", result);
        Assert.Contains("noopener", result);
        Assert.Contains("noreferrer", result);
    }

    [Fact]
    public void GetLinkHtml_WithExistingRelInHtmlAttributes_PreservesExistingRel()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External,
            Url = "/test",
            Noopener = "noopener"
        };

        var result = RenderHtml(item.GetLinkHtml(htmlAttributes: new { rel = "external" }));

        Assert.Contains("external", result);
        Assert.Contains("noopener", result);
    }

    [Fact]
    public void GetLinkHtml_TitleItemType_DoesNotAddTargetOrRel()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.Title,
            Target = "_blank",
            Noopener = "noopener"
        };

        var result = RenderHtml(item.GetLinkHtml());

        Assert.DoesNotContain("target", result);
        Assert.DoesNotContain("rel", result);
    }

    [Fact]
    public void Url_WithNoContent_ReturnsItemUrl()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            Url = "/my-url"
        };

        var result = item.Url();

        Assert.Equal("/my-url", result);
    }

    [Fact]
    public void Url_WithNoContentAndNoUrl_ReturnsHash()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            Url = null
        };

        var result = item.Url();

        Assert.Equal("#", result);
    }

    [Fact]
    public void GetItemHtml_DelegatesToGetLinkHtml()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External,
            Url = "/test"
        };

        var linkHtml = RenderHtml(item.GetLinkHtml(cssClass: "test-class"));
        var itemHtml = RenderHtml(item.GetItemHtml(cssClass: "test-class"));

        Assert.Equal(linkHtml, itemHtml);
    }
}
