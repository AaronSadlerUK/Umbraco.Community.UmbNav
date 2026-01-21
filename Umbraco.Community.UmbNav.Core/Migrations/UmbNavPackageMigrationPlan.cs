using Umbraco.Cms.Core.Packaging;

namespace Umbraco.Community.UmbNav.Core.Migrations;

internal class UmbNavPackageMigrationPlan : PackageMigrationPlan
{
    public UmbNavPackageMigrationPlan() : base(UmbNavConstants.PackageName)
    {
    }

    protected override void DefinePlan()
    {
        To<UmbNavLegacyModelMigration>(new Guid("786E9C82-8621-4B0E-8E3A-7A7AAD61B820"));
    }
}
