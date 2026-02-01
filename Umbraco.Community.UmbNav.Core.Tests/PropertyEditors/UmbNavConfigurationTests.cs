using Umbraco.Community.UmbNav.Core.PropertyEditors;

namespace Umbraco.Community.UmbNav.Core.Tests.PropertyEditors;

public class UmbNavConfigurationTests
{
    [Fact]
    public void DefaultConstructor_InitializesAllPropertiesToDefault()
    {
        var config = new UmbNavConfiguration();

        Assert.False(config.EnableTextItems);
        Assert.False(config.EnableToggleAllButton);
        Assert.False(config.AllowImageIcon);
        Assert.False(config.AllowCustomClasses);
        Assert.False(config.AllowDisplay);
        Assert.False(config.HideNoopener);
        Assert.False(config.HideNoreferrer);
        Assert.False(config.HideIncludeChildren);
        Assert.False(config.AllowDescription);
        Assert.Equal(0, config.MaxDepth);
    }

    [Fact]
    public void EnableTextItems_CanBeSet()
    {
        var config = new UmbNavConfiguration { EnableTextItems = true };

        Assert.True(config.EnableTextItems);
    }

    [Fact]
    public void EnableToggleAllButton_CanBeSet()
    {
        var config = new UmbNavConfiguration { EnableToggleAllButton = true };

        Assert.True(config.EnableToggleAllButton);
    }

    [Fact]
    public void AllowImageIcon_CanBeSet()
    {
        var config = new UmbNavConfiguration { AllowImageIcon = true };

        Assert.True(config.AllowImageIcon);
    }

    [Fact]
    public void AllowCustomClasses_CanBeSet()
    {
        var config = new UmbNavConfiguration { AllowCustomClasses = true };

        Assert.True(config.AllowCustomClasses);
    }

    [Fact]
    public void AllowDisplay_CanBeSet()
    {
        var config = new UmbNavConfiguration { AllowDisplay = true };

        Assert.True(config.AllowDisplay);
    }

    [Fact]
    public void HideNoopener_CanBeSet()
    {
        var config = new UmbNavConfiguration { HideNoopener = true };

        Assert.True(config.HideNoopener);
    }

    [Fact]
    public void HideNoreferrer_CanBeSet()
    {
        var config = new UmbNavConfiguration { HideNoreferrer = true };

        Assert.True(config.HideNoreferrer);
    }

    [Fact]
    public void HideIncludeChildren_CanBeSet()
    {
        var config = new UmbNavConfiguration { HideIncludeChildren = true };

        Assert.True(config.HideIncludeChildren);
    }

    [Fact]
    public void AllowDescription_CanBeSet()
    {
        var config = new UmbNavConfiguration { AllowDescription = true };

        Assert.True(config.AllowDescription);
    }

    [Fact]
    public void MaxDepth_CanBeSet()
    {
        var config = new UmbNavConfiguration { MaxDepth = 5 };

        Assert.Equal(5, config.MaxDepth);
    }

    [Fact]
    public void AllProperties_CanBeSetSimultaneously()
    {
        var config = new UmbNavConfiguration
        {
            EnableTextItems = true,
            EnableToggleAllButton = true,
            AllowImageIcon = true,
            AllowCustomClasses = true,
            AllowDisplay = true,
            HideNoopener = true,
            HideNoreferrer = true,
            HideIncludeChildren = true,
            AllowDescription = true,
            MaxDepth = 3
        };

        Assert.True(config.EnableTextItems);
        Assert.True(config.EnableToggleAllButton);
        Assert.True(config.AllowImageIcon);
        Assert.True(config.AllowCustomClasses);
        Assert.True(config.AllowDisplay);
        Assert.True(config.HideNoopener);
        Assert.True(config.HideNoreferrer);
        Assert.True(config.HideIncludeChildren);
        Assert.True(config.AllowDescription);
        Assert.Equal(3, config.MaxDepth);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    public void MaxDepth_AcceptsVariousValues(int maxDepth)
    {
        var config = new UmbNavConfiguration { MaxDepth = maxDepth };

        Assert.Equal(maxDepth, config.MaxDepth);
    }

    [Fact]
    public void Configuration_IsReferenceType()
    {
        var config1 = new UmbNavConfiguration { MaxDepth = 5 };
        var config2 = config1;
        config2.MaxDepth = 10;

        Assert.Equal(10, config1.MaxDepth);
        Assert.Equal(10, config2.MaxDepth);
    }

    [Fact]
    public void Configuration_SeparateInstances_AreIndependent()
    {
        var config1 = new UmbNavConfiguration { MaxDepth = 5 };
        var config2 = new UmbNavConfiguration { MaxDepth = 10 };

        Assert.Equal(5, config1.MaxDepth);
        Assert.Equal(10, config2.MaxDepth);
    }
}
