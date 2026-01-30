# Troubleshooting

Solutions to common issues when using UmbNav.

## Installation Issues

### Package Not Found

**Problem**: NuGet can't find the package.

**Solution**:
```bash
# Ensure you're using the correct package name
dotnet add package Umbraco.Community.UmbNav

# Or for Core only
dotnet add package Umbraco.Community.UmbNav.Core
```

### Version Compatibility Error

**Problem**: Package version doesn't match Umbraco version.

**Solution**: Check the [version compatibility table](../README.md#version-compatibility):

| UmbNav | Umbraco |
|--------|---------|
| 4.x | 17+ |
| 3.x | 14-16 |
| 2.x | 10-13 |

### Missing Dependencies

**Problem**: Build errors about missing assemblies.

**Solution**:
```bash
# Clear NuGet cache
dotnet nuget locals all --clear

# Restore packages
dotnet restore

# Rebuild
dotnet build
```

---

## Backoffice Issues

### Property Editor Not Showing

**Problem**: UmbNav doesn't appear in the property editor list.

**Solutions**:
1. Clear browser cache and reload
2. Check Umbraco logs for errors
3. Verify package is installed:
   ```bash
   dotnet list package | grep UmbNav
   ```
4. Restart the application

### Items Not Saving

**Problem**: Changes don't persist when saving.

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify the document type is configured correctly
3. Check Umbraco logs for save errors
4. Try a different browser

### Drag and Drop Not Working

**Problem**: Can't drag items to reorder.

**Solutions**:
1. Ensure items are collapsed (expanded items can't be dragged)
2. Clear browser cache
3. Check for JavaScript errors in console
4. Disable browser extensions that might interfere

### Content Picker Empty

**Problem**: No content appears in the content picker modal.

**Solutions**:
1. Verify content exists and is published
2. Check user permissions on content
3. If using `HideNaviHide`, ensure content doesn't have `umbracoNaviHide` set

---

## Frontend Rendering Issues

### Menu Not Displaying

**Problem**: Navigation doesn't render on the frontend.

**Solutions**:

1. **Check property value exists**:
   ```cshtml
   @{
       var nav = Model.Value<IEnumerable<UmbNavItem>>("navigation");
       if (nav == null)
       {
           <p>Navigation is null</p>
       }
       else if (!nav.Any())
       {
           <p>Navigation is empty</p>
       }
   }
   ```

2. **Verify property alias** matches exactly (case-sensitive)

3. **Use the Menu Builder Service** to process items:
   ```cshtml
   @inject IUmbNavMenuBuilderService MenuBuilder
   @{
       var rawItems = Model.Value<IEnumerable<UmbNavItem>>("navigation");
       var menu = MenuBuilder.BuildMenu(rawItems, UmbNavBuildOptions.Default);
   }
   ```

### URLs Are Wrong

**Problem**: Menu item URLs are incorrect or null.

**Solutions**:

1. **For Document items**, ensure content is published:
   ```cshtml
   @foreach (var item in menu)
   {
       @if (item.Content == null && item.ItemType == UmbNavItemType.Document)
       {
           <text>Content not found for: @item.Name</text>
       }
   }
   ```

2. **Use the extension method** for URL generation:
   ```cshtml
   <a href="@item.Url()">@item.Name</a>
   ```

3. **Check culture** for multi-language sites:
   ```cshtml
   <a href="@item.Url(culture: "en-US")">@item.Name</a>
   ```

### Active State Not Working

**Problem**: Current page isn't highlighted as active.

**Solutions**:

1. **Pass the current page** to the TagHelper:
   ```cshtml
   <umbnavitem menu-item="@item"
               active-class="active"
               current-page="@Model"
               is-active-ancestor-check="true">
   </umbnavitem>
   ```

2. **Use the extension method**:
   ```cshtml
   <a class="@(item.IsActive(Model) ? "active" : "")">
   ```

3. **Check IsActive property** is being set by the Menu Builder Service

### TagHelper Not Recognized

**Problem**: `<umbnavitem>` tag shows as unknown.

**Solutions**:

1. **Add the TagHelper directive** to `_ViewImports.cshtml`:
   ```cshtml
   @addTagHelper *, Umbraco.Community.UmbNav.Core
   ```

2. **Import the namespace**:
   ```cshtml
   @using Umbraco.Community.UmbNav.Core.TagHelpers
   ```

---

## Extension Issues

### Toolbar Action Not Appearing

**Problem**: Custom toolbar action doesn't show up.

**Solutions**:

1. **Check registration**:
   ```typescript
   import { UmbNavExtensionRegistry } from '/App_Plugins/UmbNav/dist/api.js';

   // Register on entry point load
   UmbNavExtensionRegistry.registerToolbarAction({
       alias: 'my-action',
       label: 'My Action',
       icon: 'icon-star',
       onExecute: (item, context) => {
           console.log('Action executed', item);
       }
   });
   ```

2. **Check isVisible function** returns true:
   ```typescript
   isVisible: (item, config) => {
       console.log('Visibility check', item, config);
       return true; // Debug: always show
   }
   ```

3. **Verify extension bundle is loaded** (check Network tab)

### Custom Service Not Registered

**Problem**: Custom `IUmbNavMenuBuilderService` isn't being used.

**Solutions**:

1. **Use AddUnique** to replace the default:
   ```csharp
   public class MyComposer : IComposer
   {
       public void Compose(IUmbracoBuilder builder)
       {
           builder.Services.AddUnique<IUmbNavMenuBuilderService, MyMenuBuilderService>();
       }
   }
   ```

2. **Ensure composer runs after UmbNav's**:
   ```csharp
   [ComposeAfter(typeof(RegisterUmbNavServicesComposer))]
   public class MyComposer : IComposer
   ```

---

## Performance Issues

### Slow Menu Loading

**Problem**: Large menus take a long time to render.

**Solutions**:

1. **Limit depth**:
   ```csharp
   var options = new UmbNavBuildOptions { MaxDepth = 3 };
   var menu = MenuBuilder.BuildMenu(rawItems, options);
   ```

2. **Cache the result**:
   ```csharp
   var cacheKey = $"menu_{Model.Key}";
   var menu = _cache.GetOrCreate(cacheKey, entry =>
   {
       entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
       return MenuBuilder.BuildMenu(rawItems, options);
   });
   ```

3. **Remove unused features**:
   ```csharp
   var options = new UmbNavBuildOptions
   {
       RemoveDescription = true,
       RemoveImages = true,
       RemoveCustomClasses = true
   };
   ```

### Backoffice Sluggish

**Problem**: Editing large menus in backoffice is slow.

**Solutions**:

1. **Limit maximum depth** in Data Type configuration
2. **Collapse nested items** when not editing them
3. **Consider multiple smaller menus** instead of one large one

---

## Common Error Messages

### "Cannot read properties of null"

**JavaScript Error**: Usually means an item or config is undefined.

**Solution**: Check that the property value exists and items have required properties.

### "Content not found"

**Backend Error**: Document referenced by menu item doesn't exist.

**Solutions**:
- The content was deleted
- The content was unpublished
- Check the ContentKey value

### "Invalid property type"

**Backend Error**: Property isn't configured as UmbNav type.

**Solution**: Verify the Data Type uses "UmbNav" property editor.

---

## Debug Mode

### Enable Detailed Logging

Add to `appsettings.Development.json`:

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Override": {
        "Umbraco.Community.UmbNav": "Debug"
      }
    }
  }
}
```

### Browser DevTools

1. **Console**: Check for JavaScript errors
2. **Network**: Verify API calls succeed
3. **Elements**: Inspect rendered HTML

### Razor Debug Output

```cshtml
@{
    var nav = Model.Value<IEnumerable<UmbNavItem>>("navigation");
}

<pre>
Items: @(nav?.Count() ?? 0)
@foreach (var item in nav ?? Enumerable.Empty<UmbNavItem>())
{
    <text>- @item.Name (@item.ItemType): @item.Url()</text>
}
</pre>
```

---

## Getting Help

If you can't resolve your issue:

1. **Search existing issues**: https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav/issues
2. **Open a new issue** with:
   - UmbNav version
   - Umbraco version
   - .NET version
   - Steps to reproduce
   - Error messages/screenshots
3. **Join Umbraco Discord** for community help
