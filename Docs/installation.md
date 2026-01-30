# Installation

UmbNav is distributed as NuGet packages. There are two packages available depending on your needs.

## Packages

### Umbraco.Community.UmbNav (Full Package)

The complete package including both the backoffice UI and core functionality.

**Use this if:** You're building a traditional Umbraco site with the backoffice.

```bash
dotnet add package Umbraco.Community.UmbNav
```

### Umbraco.Community.UmbNav.Core (Core Only)

Just the models, services, and rendering helpers - no backoffice UI.

**Use this if:** You're building a headless site, using the Delivery API, or only need the rendering components.

```bash
dotnet add package Umbraco.Community.UmbNav.Core
```

## Installation Methods

### .NET CLI (Recommended)

```bash
# Navigate to your web project
cd src/MyUmbracoSite

# Install the full package
dotnet add package Umbraco.Community.UmbNav

# Or install just the core
dotnet add package Umbraco.Community.UmbNav.Core
```

### Package Manager Console (Visual Studio)

```powershell
# Full package
Install-Package Umbraco.Community.UmbNav

# Core only
Install-Package Umbraco.Community.UmbNav.Core
```

### PackageReference (Manual)

Add to your `.csproj` file:

```xml
<ItemGroup>
    <PackageReference Include="Umbraco.Community.UmbNav" Version="4.*" />
</ItemGroup>
```

### NuGet Package Manager (Visual Studio)

1. Right-click your project in Solution Explorer
2. Select **Manage NuGet Packages**
3. Search for "Umbraco.Community.UmbNav"
4. Click **Install**

## Version Selection

We recommend using a version range to automatically get patch updates:

```xml
<!-- Get latest 4.x version -->
<PackageReference Include="Umbraco.Community.UmbNav" Version="4.*" />

<!-- Pin to specific version -->
<PackageReference Include="Umbraco.Community.UmbNav" Version="4.0.0" />

<!-- Minimum version -->
<PackageReference Include="Umbraco.Community.UmbNav" Version="4.0.0" />
```

## Dependencies

UmbNav has the following dependencies (automatically installed):

| Package | Version | Purpose |
|---------|---------|---------|
| Umbraco.Cms.Web.Common | ~17.0.0 | Umbraco core |

## Post-Installation

After installation:

1. **Build your project** to ensure packages are restored
2. **Run the site** - UmbNav registers itself automatically
3. **Create a Data Type** in the Umbraco backoffice using the UmbNav property editor

No additional configuration in `Startup.cs` or `Program.cs` is required - UmbNav uses Umbraco's composer system for automatic registration.

## Verifying Installation

To verify UmbNav is installed correctly:

1. Log into the Umbraco backoffice
2. Navigate to **Settings** → **Data Types** → **Create**
3. You should see "UmbNav" in the Property Editor dropdown

If you don't see it:

- Ensure the package is installed in the correct project (the web project)
- Check the build output for any errors
- Clear the Umbraco cache: delete the `/umbraco/Data/TEMP` folder and restart

## Upgrading

### From UmbNav 3.x to 4.x

Version 4.x introduces breaking changes for Umbraco 17 compatibility:

1. Update the package reference:

```xml
<PackageReference Include="Umbraco.Community.UmbNav" Version="4.*" />
```

2. Update namespaces if needed:

```csharp
// Old (3.x)
using Umbraco.Community.UmbNav;

// New (4.x)
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Community.UmbNav.Core.TagHelpers;
```

3. Rebuild and test your site

### From Legacy Versions (1.x/2.x)

If upgrading from the legacy [Our.Umbraco.UmbNav](https://github.com/AaronSadlerUK/Our.Umbraco.UmbNav) package:

1. Remove the old package
2. Install the new package
3. Data should migrate automatically
4. Update your Razor views to use the new TagHelper syntax

## Uninstalling

To remove UmbNav:

```bash
dotnet remove package Umbraco.Community.UmbNav
```

Note: This removes the package but preserves your data. To completely remove:

1. Delete any Data Types using UmbNav
2. Remove the package
3. Clean up any remaining property data in the database (optional)

## Troubleshooting Installation

### Package not found

Ensure you're using the correct package source:

```bash
dotnet nuget list source
```

The official NuGet source should be listed: `https://api.nuget.org/v3/index.json`

### Version conflicts

If you encounter version conflicts with Umbraco packages:

```bash
dotnet restore --force
```

### Build errors after installation

1. Clean the solution: `dotnet clean`
2. Delete `bin` and `obj` folders
3. Restore packages: `dotnet restore`
4. Rebuild: `dotnet build`
