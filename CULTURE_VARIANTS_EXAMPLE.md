# Culture Variants Feature - Usage Examples

This document demonstrates the new backwards-compatible culture variant support in UmbNav, allowing shared navigation structure with language-specific names and descriptions.

## Overview

With culture variants, you can:
- ✅ Maintain a single navigation structure across all languages
- ✅ Display different names/descriptions per culture
- ✅ Works for all item types (Document, External, Title)
- ✅ Fully backwards compatible - existing data continues to work

## Data Format

### JSON Structure

```json
{
  "key": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Home",
  "description": "Main page",
  "itemType": "External",
  "url": "https://example.com",
  "variants": {
    "name": {
      "en-US": "Home",
      "fr-FR": "Accueil",
      "de-DE": "Startseite",
      "es-ES": "Inicio"
    },
    "description": {
      "en-US": "Main page",
      "fr-FR": "Page principale",
      "de-DE": "Hauptseite",
      "es-ES": "Página principal"
    }
  }
}
```

### Backwards Compatibility

Old format (still works):
```json
{
  "key": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Home",
  "description": "Main page",
  "itemType": "External",
  "url": "https://example.com"
}
```

## C# Usage

### Basic Usage

```csharp
@using Umbraco.Community.UmbNav.Core.Extensions

@{
    var menuItems = Model.Value<IEnumerable<UmbNavItem>>("mainNavigation");
    var culture = System.Threading.Thread.CurrentThread.CurrentCulture.Name;
}

<ul>
    @foreach (var item in menuItems)
    {
        <li>
            <a href="@item.Url(culture)">
                @item.GetName(culture)
            </a>
        </li>
    }
</ul>
```

### With TagHelper

```cshtml
@{
    var culture = System.Threading.Thread.CurrentThread.CurrentCulture.Name;
}

<nav>
    <ul>
        @foreach (var item in menuItems)
        {
            <li>
                <umbnavitem
                    menu-item="@item"
                    culture="@culture"
                    active-class="active"
                    current-page="@Model">
                </umbnavitem>
            </li>
        }
    </ul>
</nav>
```

### Accessing Descriptions

```cshtml
<nav>
    <ul>
        @foreach (var item in menuItems)
        {
            <li>
                <a href="@item.Url(culture)"
                   title="@item.GetDescription(culture)">
                    @item.GetName(culture)
                </a>
            </li>
        }
    </ul>
</nav>
```

### Multi-Level Navigation with Variants

```cshtml
@helper RenderMenuLevel(IEnumerable<UmbNavItem> items, string culture, int level = 0)
{
    <ul class="nav-level-@level">
        @foreach (var item in items)
        {
            var hasChildren = item.Children?.Any() == true;
            <li class="@(hasChildren ? "has-submenu" : "")">
                <a href="@item.Url(culture)">
                    @item.GetName(culture)
                </a>

                @if (hasChildren)
                {
                    @RenderMenuLevel(item.Children, culture, level + 1)
                }
            </li>
        }
    </ul>
}

@{
    var culture = System.Threading.Thread.CurrentThread.CurrentCulture.Name;
}

<nav aria-label="Main navigation">
    @RenderMenuLevel(menuItems, culture)
</nav>
```

## Fallback Behavior

The variant system uses intelligent fallbacks:

1. **Specified culture exists**: Returns variant value
2. **Specified culture missing**: Falls back to invariant `Name`/`Description`
3. **No culture specified**: Returns invariant `Name`/`Description`
4. **Empty variant string**: Falls back to invariant value

Example:
```csharp
var item = new UmbNavItem
{
    Name = "Home",
    Variants = new UmbNavItemVariants
    {
        Name = new Dictionary<string, string>
        {
            { "en-US", "Home" },
            { "fr-FR", "Accueil" }
        }
    }
};

item.GetName("en-US")  // Returns: "Home"
item.GetName("fr-FR")  // Returns: "Accueil"
item.GetName("es-ES")  // Returns: "Home" (fallback)
item.GetName(null)     // Returns: "Home" (invariant)
```

## Document Items + Content Variants

For Document items, the system automatically falls back to Umbraco's content variants:

```csharp
// If Variants.Name is not set, it will try to get the name from the content node
item.GetName("fr-FR")
// 1. Checks item.Variants.Name["fr-FR"]
// 2. If not found, checks item.Content.Name("fr-FR")
// 3. If not found, returns item.Name
```

This means Document items can use either:
- UmbNav variants (for custom navigation text)
- Umbraco content variants (for content node names)

## Frontend UI Implementation (Future Enhancement)

The backend is ready for culture variants. A frontend UI enhancement would add:

1. **Culture tabs** in the property editor
2. **Per-culture input fields** for name/description
3. **Visual indicators** showing which cultures have translations
4. **Culture switcher** for editing

Example mockup:
```
┌─────────────────────────────────┐
│ [EN] [FR] [DE] [ES]             │  ← Culture tabs
├─────────────────────────────────┤
│ Name: Accueil                   │  ← French variant
│ Description: Page principale    │
│ URL: https://example.com        │
└─────────────────────────────────┘
```

## Migration Path

Existing data automatically works:
- ✅ No migration needed
- ✅ Add variants incrementally
- ✅ Old code continues to work
- ✅ New code gets variant support

## Use Cases

### 1. External Links with Translations
```json
{
  "name": "Visit our shop",
  "itemType": "External",
  "url": "https://shop.example.com",
  "variants": {
    "name": {
      "en-US": "Visit our shop",
      "fr-FR": "Visitez notre boutique",
      "de-DE": "Besuchen Sie unseren Shop"
    }
  }
}
```

### 2. Text Items (Headings) with Translations
```json
{
  "name": "Products",
  "itemType": "Title",
  "variants": {
    "name": {
      "en-US": "Products",
      "fr-FR": "Produits",
      "de-DE": "Produkte"
    }
  }
}
```

### 3. Custom Navigation Text for Document Items
```json
{
  "name": "About Us",
  "itemType": "Document",
  "contentKey": "...",
  "variants": {
    "name": {
      "en-US": "About Us",
      "fr-FR": "À propos"
    },
    "description": {
      "en-US": "Learn more about our company",
      "fr-FR": "En savoir plus sur notre entreprise"
    }
  }
}
```

## API Reference

### Extension Methods

```csharp
// Get culture-specific name
string GetName(this UmbNavItem item, string? culture = null)

// Get culture-specific description
string? GetDescription(this UmbNavItem item, string? culture = null)
```

### Model

```csharp
public class UmbNavItem
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public UmbNavItemVariants? Variants { get; set; }
}

public class UmbNavItemVariants
{
    public Dictionary<string, string>? Name { get; set; }
    public Dictionary<string, string>? Description { get; set; }
}
```

## Notes

- ✅ 100% backwards compatible
- ✅ No breaking changes
- ✅ Works with existing code
- ✅ All 133 tests passing
- ⚠️ Frontend UI for editing variants is not yet implemented (manual JSON editing required)
- ⚠️ For programmatic access only at this stage
