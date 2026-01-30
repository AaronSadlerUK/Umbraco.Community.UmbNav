# Upgrading

This guide covers upgrading UmbNav between major versions, including the automatic data migration process.

## Version Compatibility

| UmbNav Version | Umbraco Version | .NET Version |
|----------------|-----------------|--------------|
| 4.x | 17+ | .NET 10 |
| 3.x | 14-16 | .NET 8/9 |
| 2.x | 10-13 | .NET 6/7/8 |
| 1.x | 8-9 | .NET Framework / .NET 5 |

## Upgrading to UmbNav 4.x

### Prerequisites

1. **Umbraco 17+** - Upgrade Umbraco first
2. **Backup** - Always backup your database before upgrading
3. **.NET 10** - Ensure your project targets .NET 10

### Upgrade Steps

1. **Remove old package references**:
   ```bash
   dotnet remove package Umbraco.Community.UmbNav
   ```

2. **Add new package**:
   ```bash
   dotnet add package Umbraco.Community.UmbNav
   ```

3. **Build and run**:
   ```bash
   dotnet build
   dotnet run
   ```

4. **Automatic migration runs** on first startup

### Automatic Data Migration

UmbNav 4.x includes an automatic migration system that runs on first startup after upgrading. This migration:

1. **Detects legacy data types** using the old `AaronSadler.UmbNav` property editor alias
2. **Transforms content data** from the old format to the new format
3. **Updates data type definitions** to use the new `Umbraco.Community.UmbNav` alias
4. **Preserves all menu data** including nested children, images, and settings

#### What Gets Migrated

| Old Property | New Property | Notes |
|-------------|--------------|-------|
| `udi` | `contentKey` | Converted from UDI to GUID |
| `title` | `name` | Title takes precedence over name |
| `name` | `name` | Used if title is empty |
| `url` | `url` | Preserved |
| `itemType` (Link) | `itemType` (External) | Renamed |
| `itemType` (Content) | `itemType` (Document) | Renamed |
| `itemType` (Label) | `itemType` (Title) | Renamed |
| `anchor` | `anchor` | Preserved |
| `target` | `target` | Preserved |
| `noopener` (bool) | `noopener` (string) | Converted to string |
| `noreferrer` (bool) | `noreferrer` (string) | Converted to string |
| `children` | `children` | Recursively migrated |
| `image` | `imageArray` | Preserved |
| `customClasses` | `customClasses` | Preserved |
| `hideLoggedIn` | `hideLoggedIn` | Preserved |
| `hideLoggedOut` | `hideLoggedOut` | Preserved |
| `includeChildNodes` | `includeChildNodes` | Preserved |
| `description` | `description` | Preserved |
| `icon` | `icon` | Preserved |

#### Item Type Mapping

| Old Type | New Type |
|----------|----------|
| `Link` (0) | `External` |
| `Content` (1) | `Document` |
| `Label` (2) | `Title` |

#### Migration Process

The migration runs automatically via Umbraco's package migration system:

```
UmbNavPackageMigrationPlan
└── UmbNavLegacyModelMigration (786E9C82-8621-4B0E-8E3A-7A7AAD61B820)
    ├── Find all data types with "AaronSadler.UmbNav" alias
    ├── Find all content types using those data types
    ├── For each content node:
    │   ├── Read legacy JSON value
    │   ├── Transform to new format
    │   └── Save updated content
    └── Update data type to new alias
```

#### Verifying Migration

After upgrade, verify the migration completed:

1. **Check Umbraco logs** for migration messages:
   ```
   Starting UmbNav legacy model migration.
   Converting legacy UmbNav data format for instances of {ContentType}
   Completed UmbNav legacy model migration.
   ```

2. **Check data types** - Should now use `Umbraco.Community.UmbNav` alias

3. **Test navigation** - Verify menus render correctly on frontend

#### Troubleshooting Migration

**Migration didn't run:**
- Check if `umbracoKeyValue` table has the migration key
- Delete the key to re-run: `786E9C82-8621-4B0E-8E3A-7A7AAD61B820`

**Content not migrated:**
- Check logs for errors
- Verify content isn't trashed (trashed content is skipped)
- Manual migration may be needed for edge cases

**Data type not updated:**
- Check logs for "Unable to update data type" errors
- Manually change the property editor alias if needed

### Breaking Changes in 4.x

#### Frontend (TypeScript)

1. **New extension system** - Old AngularJS extensions won't work
2. **Lit components** - UI rebuilt with Lit web components
3. **New API imports** - Use `/App_Plugins/UmbNav/dist/api.js`

#### Backend (C#)

1. **Virtual methods** - Service methods are now virtual for extension
2. **UmbNavBuildOptions** - New class for menu processing options
3. **Item type enum** - `UmbNavItemType` values renamed

#### Data Model

1. **noopener/noreferrer** - Changed from `bool` to `string`
2. **contentKey** - Now uses `Guid` instead of UDI string
3. **itemType** - Enum values renamed (see table above)

---

## Upgrading from 2.x to 3.x

This upgrade path is for moving from Umbraco 10-13 to Umbraco 14+.

### Key Changes

1. **AngularJS to Lit** - Complete frontend rewrite
2. **New property editor** - Different backoffice UI
3. **Same data format** - Content data compatible

### Steps

1. Upgrade Umbraco to 14+
2. Update package reference
3. Rebuild and test

---

## Upgrading from 1.x to 2.x

This upgrade path is for moving from Umbraco 8/9 to Umbraco 10+.

### Key Changes

1. **.NET upgrade** - Framework to modern .NET
2. **Package restructure** - New namespace
3. **Same features** - Backward compatible

### Steps

1. Upgrade Umbraco to 10+
2. Update package reference
3. Update any custom code namespaces
4. Rebuild and test

---

## Manual Migration

If automatic migration fails or you need manual control:

### Export/Import Approach

1. **Export content** using uSync before upgrade
2. **Upgrade packages**
3. **Transform data** using a script
4. **Re-import content**

### Database Script Approach

For direct database manipulation (use with caution):

```sql
-- Find affected content
SELECT c.nodeId, c.alias, pd.textValue
FROM cmsPropertyData pd
JOIN cmsPropertyType pt ON pd.propertytypeid = pt.id
JOIN umbracoContentVersion cv ON pd.versionId = cv.id
JOIN cmsContent c ON cv.nodeId = c.nodeId
WHERE pt.propertyEditorAlias = 'AaronSadler.UmbNav'
AND cv.current = 1;
```

### Programmatic Migration

Create a custom migration if needed:

```csharp
public class CustomUmbNavMigration : MigrationBase
{
    public CustomUmbNavMigration(IMigrationContext context) : base(context)
    {
    }

    protected override void Migrate()
    {
        // Custom migration logic
        // Use UmbNavLegacyModelMigration.TryTransformLegacyValue() as reference
    }
}
```

---

## Rollback

If you need to rollback after upgrading:

1. **Restore database backup**
2. **Restore previous package version**:
   ```bash
   dotnet add package Umbraco.Community.UmbNav --version 3.x.x
   ```
3. **Rebuild and deploy**

> **Warning**: Rolling back after migration will lose any content changes made after the upgrade.

---

## Getting Help

- **GitHub Issues**: Report migration problems
- **Logs**: Include Umbraco logs when reporting issues
- **Database backup**: Always have a backup before upgrading

## Next Steps

- [Installation](installation.md) - Fresh installation guide
- [Configuration](configuration.md) - Configure your Data Types
- [Troubleshooting](reference/troubleshooting.md) - Common issues
