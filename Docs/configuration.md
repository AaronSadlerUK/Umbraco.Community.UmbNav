# Configuration

UmbNav is configured through the Data Type settings in the Umbraco backoffice. This page documents all available configuration options.

## Data Type Configuration

When creating or editing a UmbNav Data Type, you have access to the following options:

### Basic Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **Enable Text Items** | Boolean | `false` | Allow editors to add non-clickable text labels (useful for mega menu headings) |
| **Enable Toggle All Button** | Boolean | `false` | Show a button to expand/collapse all items at once |
| **Max Depth** | Integer | `0` | Maximum nesting depth. `0` = unlimited, `1` = no children allowed |

### Item Features

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **Allow Image/Icon** | Boolean | `false` | Allow editors to attach images to menu items |
| **Allow Custom Classes** | Boolean | `false` | Allow editors to add custom CSS classes to items |
| **Allow Description** | Boolean | `false` | Allow editors to add descriptions to items |
| **Allow Display Settings** | Boolean | `false` | Allow editors to control item visibility based on member authentication |

### Link Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **Hide Noopener** | Boolean | `false` | Hide the "Add noopener" checkbox for external links |
| **Hide Noreferrer** | Boolean | `false` | Hide the "Add noreferrer" checkbox for external links |
| **Hide Include Children** | Boolean | `false` | Hide the "Include Child Nodes" option for content items |

## Configuration Examples

### Simple Navigation

For a basic top-level navigation without dropdowns:

- **Max Depth**: `1` (prevents nesting)
- **Enable Text Items**: `false`
- **Allow Image/Icon**: `false`
- **Allow Custom Classes**: `false`

### Mega Menu

For a complex mega menu with images and sections:

- **Max Depth**: `3` or `0` (unlimited)
- **Enable Text Items**: `true` (for section headings)
- **Allow Image/Icon**: `true`
- **Allow Custom Classes**: `true`
- **Allow Description**: `true`

### Member-Aware Navigation

For navigation that changes based on login status:

- **Allow Display Settings**: `true`
- All other options as needed

### External Link Security

For navigation with external links where security attributes are mandatory:

- **Hide Noopener**: `false` (show the option)
- **Hide Noreferrer**: `false` (show the option)

Note: These options control editor visibility. Use [Build Options](models/build-options.md) to enforce or remove these attributes at render time.

## appsettings.json Configuration

UmbNav supports optional configuration via `appsettings.json` for telemetry:

```json
{
  "UmbNav": {
    "DisableTelemetry": false
  }
}
```

### Telemetry

UmbNav collects anonymous usage telemetry to help improve the package. This includes:

- Umbraco version
- UmbNav version
- Basic usage statistics

To disable telemetry:

```json
{
  "UmbNav": {
    "DisableTelemetry": true
  }
}
```

## Programmatic Configuration

For advanced scenarios, you can configure UmbNav programmatically using a composer:

```csharp
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Services;

public class UmbNavConfigurationComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // Replace the menu builder service with a custom implementation
        builder.Services.AddUnique<IUmbNavMenuBuilderService, CustomMenuBuilderService>();
    }
}
```

See [Extending the Menu Builder Service](extensibility/backend/menu-builder-service.md) for more details.

## Property Configuration

Each UmbNav property can be configured independently through its Data Type. This allows you to have multiple navigation properties with different configurations:

```
Site Settings
├── Main Navigation (UmbNav - Max Depth: 2, No Images)
├── Footer Navigation (UmbNav - Max Depth: 1, No Children)
└── Mega Menu (UmbNav - Unlimited Depth, Images, Text Items)
```

## Runtime Configuration via Build Options

When rendering menus, you can override certain behaviors using `UmbNavBuildOptions`:

```csharp
var options = new UmbNavBuildOptions
{
    MaxDepth = 2,                  // Override max depth at render time
    RemoveDescription = true,      // Strip descriptions from output
    RemoveCustomClasses = false,   // Keep custom classes
    RemoveImages = false,          // Keep images
    RemoveNoopener = false,        // Keep noopener attributes
    RemoveNoreferrer = false,      // Keep noreferrer attributes
    HideIncludeChildren = false    // Process child inclusion
};

var menu = menuBuilderService.BuildMenu(items, options);
```

See [Build Options](models/build-options.md) for complete documentation.

## Best Practices

### 1. Create Purpose-Specific Data Types

Don't reuse the same Data Type for different navigation needs. Create separate Data Types for:

- Main navigation
- Footer links
- Sidebar menus
- Mega menus

### 2. Limit Depth Appropriately

Set `Max Depth` to prevent overly complex navigation structures:

- **Top navigation**: 2-3 levels
- **Footer**: 1-2 levels
- **Sidebar**: 2-3 levels
- **Mega menu**: 3-4 levels

### 3. Enable Only Needed Features

Only enable features that editors will actually use. This simplifies the editing experience and reduces potential for misconfiguration.

### 4. Document Your Configuration

For team projects, document what each Data Type is for and how it should be used.

## Migrating Configuration

When migrating from older versions:

### From 3.x to 4.x

Configuration options remain largely the same. Data Type settings should migrate automatically.

### From 2.x to 4.x

Some options have been renamed:

| Old Name (2.x) | New Name (4.x) |
|----------------|----------------|
| `allowTextItems` | `enableTextItems` |
| `showToggleAll` | `enableToggleAllButton` |
| `maxLevels` | `maxDepth` |

Data will migrate automatically, but verify your Data Type settings after upgrading.
