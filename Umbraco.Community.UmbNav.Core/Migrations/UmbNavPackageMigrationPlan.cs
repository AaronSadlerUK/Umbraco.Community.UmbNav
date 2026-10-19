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

        // Runs the migration again for sites that already ran the first step, now that it also
        // reaches values inside blocks and converts Meganav data. Values already in the current
        // shape are left alone, so running it twice is safe.
        To<UmbNavLegacyModelMigration>(new Guid("5D0C6E1A-3F7B-4E2B-9C1D-8A4F2B6E7C30"));
    }
}
