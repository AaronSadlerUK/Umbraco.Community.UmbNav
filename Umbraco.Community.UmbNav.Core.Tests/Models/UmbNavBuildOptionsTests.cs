using Umbraco.Community.UmbNav.Core.Models;

namespace Umbraco.Community.UmbNav.Core.Tests.Models;

public class UmbNavBuildOptionsTests
{
    [Fact]
    public void Default_ReturnsNewInstance_WithAllOptionsFalse()
    {
        var options = UmbNavBuildOptions.Default;

        Assert.False(options.RemoveNoopener);
        Assert.False(options.RemoveNoreferrer);
        Assert.False(options.HideIncludeChildren);
        Assert.False(options.RemoveDescription);
        Assert.False(options.RemoveCustomClasses);
        Assert.False(options.RemoveImages);
    }

    [Fact]
    public void Default_ReturnsNewInstanceEachTime()
    {
        var options1 = UmbNavBuildOptions.Default;
        var options2 = UmbNavBuildOptions.Default;

        Assert.NotSame(options1, options2);
    }

    [Fact]
    public void Properties_CanBeSetIndividually()
    {
        var options = new UmbNavBuildOptions
        {
            RemoveNoopener = true,
            RemoveDescription = true
        };

        Assert.True(options.RemoveNoopener);
        Assert.False(options.RemoveNoreferrer);
        Assert.False(options.HideIncludeChildren);
        Assert.True(options.RemoveDescription);
        Assert.False(options.RemoveCustomClasses);
        Assert.False(options.RemoveImages);
    }
}
