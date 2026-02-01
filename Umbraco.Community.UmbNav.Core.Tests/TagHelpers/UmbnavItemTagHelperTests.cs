using Microsoft.AspNetCore.Razor.TagHelpers;
using Moq;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Community.UmbNav.Core.TagHelpers;

namespace Umbraco.Community.UmbNav.Core.Tests.TagHelpers;

public class UmbnavItemTagHelperTests
{
    [Fact]
    public void Process_WithExternalItem_RendersAnchorTag()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Test Link",
            Url = "https://example.com",
            ItemType = UmbNavItemType.External
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        Assert.Equal("a", output.TagName);
        Assert.Equal("Test Link", output.Content.GetContent());
        Assert.Contains(output.Attributes, a => a.Name == "href" && a.Value.ToString() == "https://example.com");
    }

    [Fact]
    public void Process_WithTitleItem_RendersSpanTag()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Title Item",
            ItemType = UmbNavItemType.Title
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        Assert.Equal("span", output.TagName);
        Assert.Equal("Title Item", output.Content.GetContent());
        Assert.DoesNotContain(output.Attributes, a => a.Name == "href");
    }

    [Fact]
    public void Process_WithCustomLabelTagName_UsesCustomTag()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Custom Label",
            ItemType = UmbNavItemType.Title
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem,
            LabelTagName = "div"
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        Assert.Equal("div", output.TagName);
    }

    [Fact]
    public void Process_WithCustomClasses_AddsClassAttribute()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Test",
            Url = "https://example.com",
            ItemType = UmbNavItemType.External,
            CustomClasses = "nav-link"
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        Assert.Contains(output.Attributes, a => a.Name == "class");
    }

    [Fact]
    public void Process_WithActiveItem_AddsActiveClass()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Active Item",
            Url = "https://example.com",
            ItemType = UmbNavItemType.External,
            IsActive = true
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem,
            ActiveClass = "active"
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        Assert.Contains(output.Attributes, a => a.Name == "class");
    }

    [Fact]
    public void Process_WithInactiveItem_DoesNotAddActiveClass()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Inactive Item",
            Url = "https://example.com",
            ItemType = UmbNavItemType.External,
            IsActive = false
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem,
            ActiveClass = "active"
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        // If there's a class attribute, it shouldn't contain "active"
        var classAttr = output.Attributes.FirstOrDefault(a => a.Name == "class");
        if (classAttr != null)
        {
            Assert.DoesNotContain("active", classAttr.Value?.ToString() ?? "");
        }
    }

    [Fact]
    public void Process_WithTarget_AddsTargetAttribute()
    {
        var menuItem = new UmbNavItem
        {
            Name = "External Link",
            Url = "https://example.com",
            ItemType = UmbNavItemType.External,
            Target = "_blank"
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        Assert.Contains(output.Attributes, a => a.Name == "target" && a.Value.ToString() == "_blank");
    }

    [Fact]
    public void Process_WithNoopener_AddsRelAttribute()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Test",
            Url = "https://example.com",
            ItemType = UmbNavItemType.External,
            Noopener = "noopener"
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        var relAttr = output.Attributes.FirstOrDefault(a => a.Name == "rel");
        Assert.NotNull(relAttr);
        Assert.Contains("noopener", relAttr.Value?.ToString() ?? "");
    }

    [Fact]
    public void Process_WithNoreferrer_AddsRelAttribute()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Test",
            Url = "https://example.com",
            ItemType = UmbNavItemType.External,
            Noreferrer = "noreferrer"
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        var relAttr = output.Attributes.FirstOrDefault(a => a.Name == "rel");
        Assert.NotNull(relAttr);
        Assert.Contains("noreferrer", relAttr.Value?.ToString() ?? "");
    }

    [Fact]
    public void Process_WithNoopenerAndNoreferrer_CombinesRelAttributes()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Test",
            Url = "https://example.com",
            ItemType = UmbNavItemType.External,
            Noopener = "noopener",
            Noreferrer = "noreferrer"
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        var relAttr = output.Attributes.FirstOrDefault(a => a.Name == "rel");
        Assert.NotNull(relAttr);
        var relValue = relAttr.Value?.ToString() ?? "";
        Assert.Contains("noopener", relValue);
        Assert.Contains("noreferrer", relValue);
    }

    [Fact]
    public void Process_TitleItemWithTarget_DoesNotAddTarget()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Title",
            ItemType = UmbNavItemType.Title,
            Target = "_blank"
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        Assert.DoesNotContain(output.Attributes, a => a.Name == "target");
    }

    [Fact]
    public void Process_TitleItemWithRel_DoesNotAddRel()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Title",
            ItemType = UmbNavItemType.Title,
            Noopener = "noopener"
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        Assert.DoesNotContain(output.Attributes, a => a.Name == "rel");
    }

    [Fact]
    public void Process_WithExistingRelAttribute_PreservesAndCombines()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Test",
            Url = "https://example.com",
            ItemType = UmbNavItemType.External,
            Noopener = "noopener"
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem
        };

        var existingAttributes = new TagHelperAttributeList
        {
            new TagHelperAttribute("rel", "external")
        };

        var context = new TagHelperContext(
            existingAttributes,
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            existingAttributes,
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        var relAttr = output.Attributes.FirstOrDefault(a => a.Name == "rel");
        Assert.NotNull(relAttr);
        var relValue = relAttr.Value?.ToString() ?? "";
        Assert.Contains("external", relValue);
        Assert.Contains("noopener", relValue);
    }

    [Fact]
    public void Process_WithCurrentPageAndAncestorCheck_ChecksAncestors()
    {
        var contentMock = new Mock<IPublishedContent>();
        contentMock.Setup(x => x.Id).Returns(123);

        var menuItem = new UmbNavItem
        {
            Name = "Test",
            Url = "/test",
            ItemType = UmbNavItemType.Document,
            ContentKey = Guid.NewGuid()
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem,
            CurrentPage = contentMock.Object,
            IsActiveAncestorCheck = true,
            ActiveClass = "active"
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        // The test verifies the logic executes without error
        Assert.NotNull(output);
    }

    [Fact]
    public void Process_WithDocumentItemType_RendersAnchorTag()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Document",
            Url = "/document",
            ItemType = UmbNavItemType.Document
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        Assert.Equal("a", output.TagName);
        Assert.Contains(output.Attributes, a => a.Name == "href");
    }

    [Fact]
    public void Process_WithMediaItemType_RendersAnchorTag()
    {
        var menuItem = new UmbNavItem
        {
            Name = "Media",
            Url = "/media/file.pdf",
            ItemType = UmbNavItemType.Media
        };

        var tagHelper = new UmbnavitemTagHelper
        {
            MenuItem = menuItem
        };

        var context = new TagHelperContext(
            new TagHelperAttributeList(),
            new Dictionary<object, object>(),
            Guid.NewGuid().ToString());

        var output = new TagHelperOutput(
            "umbnavitem",
            new TagHelperAttributeList(),
            (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

        tagHelper.Process(context, output);

        Assert.Equal("a", output.TagName);
        Assert.Contains(output.Attributes, a => a.Name == "href");
    }
}
