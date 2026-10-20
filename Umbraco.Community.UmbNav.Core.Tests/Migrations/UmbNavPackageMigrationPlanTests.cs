using Umbraco.Community.UmbNav.Core.Migrations;

namespace Umbraco.Community.UmbNav.Core.Tests.Migrations;

public class UmbNavPackageMigrationPlanTests
{
    [Fact]
    public void Plan_IsValid_AndRunsTheLegacyMigrationAgainForSitesThatAlreadyRanIt()
    {
        var plan = new UmbNavPackageMigrationPlan();

        plan.Validate();

        Assert.Equal(new Guid("5D0C6E1A-3F7B-4E2B-9C1D-8A4F2B6E7C30").ToString(), plan.FinalState, ignoreCase: true);
        var transitions = plan.Transitions.Values.Where(t => t != null).ToArray();
        Assert.Equal(2, transitions.Length);
        Assert.All(transitions, t => Assert.Equal(typeof(UmbNavLegacyModelMigration), t!.MigrationType));
    }
}
