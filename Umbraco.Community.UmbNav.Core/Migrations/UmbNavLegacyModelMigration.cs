using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.ContentPublishing;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Services.OperationStatus;
using Umbraco.Cms.Core.Strings;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Packaging;
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Extensions;

namespace Umbraco.Community.UmbNav.Core.Migrations;

/// <summary>
/// A content node resolved from a legacy item's udi or node id, used to name and key it.
/// </summary>
internal readonly record struct LegacyContentInfo(Guid Key, string? Name);

internal sealed class UmbNavLegacyModelMigration : AsyncPackageMigrationBase
{
    private readonly ILogger<UmbNavLegacyModelMigration> _logger;
    private readonly IContentTypeService _contentTypeService;
    private readonly IContentService _contentService;
    private readonly IContentPublishingService _contentPublishingService;
    private readonly IDataTypeService _dataTypeService;
    private readonly PropertyEditorCollection _propertyEditorCollection;
    private readonly IConfigurationEditorJsonSerializer _configurationEditorJsonSerializer;
    private readonly IMigrationContext _migrationContext;
    private readonly TimeProvider _timeProvider;
    private Dictionary<Guid, IContentType> _contentTypesByKey = [];

    // Editors whose data types are switched to UmbNav, with their values transformed.
    private static readonly string[] LegacyEditorAliases =
    [
        UmbNavConstants.LegacyEditorAlias,
        UmbNavConstants.MeganavEditorAlias,
        UmbNavConstants.MeganavV8EditorAlias,
        "Meganav",
        "Cogworks.Meganav"
    ];

    private static readonly string[] MeganavEditorAliases = LegacyEditorAliases[1..];

    private static readonly HashSet<string> BlockEditorAliases =
    [
        Constants.PropertyEditors.Aliases.BlockList,
        Constants.PropertyEditors.Aliases.BlockGrid,
        Constants.PropertyEditors.Aliases.RichText
    ];

    public UmbNavLegacyModelMigration(ILogger<UmbNavLegacyModelMigration> logger, IContentTypeService contentTypeService, IContentService contentService, IContentPublishingService contentPublishingService, IDataTypeService dataTypeService, PropertyEditorCollection propertyEditorCollection, IConfigurationEditorJsonSerializer configurationEditorJsonSerializer, TimeProvider timeProvider, IPackagingService packagingService, IMediaService mediaService, MediaFileManager mediaFileManager, MediaUrlGeneratorCollection mediaUrlGenerators, IShortStringHelper shortStringHelper, IContentTypeBaseServiceProvider contentTypeBaseServiceProvider, IMigrationContext context, IOptions<PackageMigrationSettings> packageMigrationsSettings) : base(packagingService, mediaService, mediaFileManager, mediaUrlGenerators, shortStringHelper, contentTypeBaseServiceProvider, context, packageMigrationsSettings)
    {
        _logger = logger;
        _contentTypeService = contentTypeService;
        _contentService = contentService;
        _contentPublishingService = contentPublishingService;
        _dataTypeService = dataTypeService;
        _propertyEditorCollection = propertyEditorCollection;
        _configurationEditorJsonSerializer = configurationEditorJsonSerializer;
        _timeProvider = timeProvider;
        _migrationContext = context;
    }

    protected override async Task MigrateAsync()
    {
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("Starting UmbNav legacy model migration.");
        }

        if (!_propertyEditorCollection.TryGet(UmbNavConstants.PropertyEditorAlias, out IDataEditor? dataEditor) || dataEditor == null)
        {
            if (_logger.IsEnabled(LogLevel.Information))
            {
                _logger.LogInformation("Could not find new UmbNav data editor");
            }
            return;
        }

        var dataTypes = new List<IDataType>();
        foreach (var alias in LegacyEditorAliases)
        {
            dataTypes.AddRange(await _dataTypeService.GetByEditorAliasAsync(alias));
        }

        // Content is migrated before the data types are switched, because the legacy editor alias
        // is what identifies the properties to transform. This also runs when no legacy data types
        // are left: data that was copied onto a current UmbNav property, or that sits inside blocks
        // an earlier version of this migration could not reach, is found by its shape instead.
        bool hadContentToMigrate = await MigrateLegacyContentAsync();
        if (!hadContentToMigrate && _logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("No content types found with a legacy or current UmbNav property.");
        }

        foreach (IDataType datatype in dataTypes)
        {
            Attempt<IDataType, DataTypeOperationStatus> result = await _dataTypeService.UpdateAsync(GenerateUpdatedDataType(datatype, dataEditor), Constants.Security.SuperUserKey);
            if (!result.Success && _logger.IsEnabled(LogLevel.Error))
            {
                _logger.LogError("Unable to update data type {dataTypeKey} to new UmbNav alias", datatype.Key);
            }
        }

        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("Completed UmbNav legacy model migration.");
        }
    }

    private async Task<bool> MigrateLegacyContentAsync()
    {
        var allContentTypes = _contentTypeService.GetAll().ToArray();
        _contentTypesByKey = allContentTypes.ToDictionary(ct => ct.Key);

        // Nav properties on element types are only reachable through the block values of the
        // documents that use them, so when any exist every document with a block property is walked.
        var navOnElements = allContentTypes.Any(ct => ct.IsElement && HasNavProperty(ct));

        var contentTypes = allContentTypes
            .Where(ct => !ct.IsElement && (HasNavProperty(ct) || (navOnElements && HasBlockProperty(ct))))
            .ToArray();

        if (contentTypes.Length == 0)
            return false;

        foreach (var contentType in contentTypes)
        {
            using (_logger.BeginScope(new Dictionary<string, object>
            {
                ["ContentTypeName"] = contentType.Name ?? "Unknown Type",
                ["ContentTypeKey"] = contentType.Key
            }))
            {
                await ProcessContentTypeAsync(contentType);
            }
        }

        return true;
    }

    private async Task ProcessContentTypeAsync(IContentType contentType)
    {
        if (_logger.IsEnabled(LogLevel.Debug))
        {
            _logger.LogDebug("Found content type {ContentTypeName} with legacy UmbNav property editor.", contentType.Name);
        }

        var page = 0;
        var pageSize = 100;
        var contentQueryFilter = new Cms.Infrastructure.Persistence.Querying.Query<IContent>(_migrationContext.SqlContext).Where(c => !c.Trashed);
        var pagedContent = _contentService.GetPagedOfType(contentType.Id, page, pageSize, out long totalRecords,
           contentQueryFilter);
        var loop = true;

        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("Converting legacy UmbNav data format for instances of {contentType}", contentType.Name);
        }
        do
        {
            foreach (var content in pagedContent)
            {
                using (_logger.BeginScope(new Dictionary<string, object>
                {
                    ["ContentNode"] = content.Key
                }))
                {
                    // Snapshot the publish state before transforming the draft, because setting a
                    // property value flips Edited in memory. We only republish nodes that were
                    // published with no pending draft changes, so we must capture that up front.
                    var wasPublished = content.Published;
                    var hadPendingChanges = content.Edited;
                    var publishedCultures = content.PublishedCultures?.ToArray() ?? [];

                    var saveContent = false;
                    foreach (var property in content.Properties)
                    {
                        var editorAlias = property.PropertyType.PropertyEditorAlias;
                        if (!IsNavEditor(editorAlias) && !BlockEditorAliases.Contains(editorAlias))
                        {
                            continue;
                        }

                        if (property.PropertyType.VariesByCulture())
                        {
                            foreach (var culture in content.AvailableCultures)
                            {
                                saveContent |= GetValueAndTryTransform(property, culture);
                            }
                        }
                        else
                        {
                            saveContent |= GetValueAndTryTransform(property, null);
                        }
                    }

                    if (saveContent)
                    {
                        await SaveOrRepublishAsync(content, wasPublished, hadPendingChanges, publishedCultures);
                        if (_logger.IsEnabled(LogLevel.Debug))
                        {
                            _logger.LogDebug("Updated content ID {ContentId} of type {ContentTypeName}.", content.Id, contentType.Name);
                        }
                    }
                }
            }

            loop = (page + 1) * pageSize < totalRecords;
            if(loop)
            {
                page++;
                pagedContent = _contentService.GetPagedOfType(contentType.Id, page, pageSize, out _,
                    contentQueryFilter);
            }

        } while (loop);

    }

    // IContentService.Save only rewrites the draft version. For content that was published the
    // front-end reads the published value, which would stay in the legacy shape (no "name") and
    // make the runtime converter fail. Save the transformed draft, then republish so the published
    // value is rewritten too - but only for nodes that were published with no pending draft
    // changes. Republishing a node that already had unpublished edits would promote those edits,
    // and a migration must never publish an editor's in-progress draft. Draft-only nodes and nodes
    // with pending changes are left for the converter's legacy fallback / the editor's next publish.
    private async Task SaveOrRepublishAsync(IContent content, bool wasPublished, bool hadPendingChanges, string[] publishedCultures)
    {
        _contentService.Save(content);

        if (!wasPublished || hadPendingChanges)
        {
            return;
        }

        // Invariant content reports no published cultures, so publish it with a null (invariant)
        // culture; variant content republishes only the cultures that were already published.
        var culturesToPublish = publishedCultures.Length > 0
            ? publishedCultures.Select(c => new CulturePublishScheduleModel { Culture = c }).ToArray()
            : [new CulturePublishScheduleModel { Culture = null }];

        var result = await _contentPublishingService.PublishAsync(content.Key, culturesToPublish, Constants.Security.SuperUserKey);
        if (!result.Success && _logger.IsEnabled(LogLevel.Error))
        {
            _logger.LogError("Unable to republish migrated UmbNav content {ContentKey}. Status: {Status}", content.Key, result.Status);
        }
    }

    private bool GetValueAndTryTransform(IProperty property, string? culture)
    {
        var legacyValue = property.GetValue(culture)?.ToString();
        if (string.IsNullOrWhiteSpace(legacyValue))
        {
            return false;
        }

        try
        {
            Func<Guid?, int?, LegacyContentInfo?> resolveContent = (key, id) => ResolveContent(key, id, culture);
            var newValue = string.Empty;
            var hasTransformed = IsNavEditor(property.PropertyType.PropertyEditorAlias)
                ? IsLegacyValue(legacyValue) && TryTransformLegacyValue(_logger, legacyValue, resolveContent, out newValue)
                : TryTransformBlockValue(_logger, legacyValue, GetElementPropertyEditorAlias, resolveContent, out newValue);

            if (hasTransformed)
            {
                property.SetValue(newValue, culture);
                return true;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Something went wrong migrating legacy content.{legacyValue}", legacyValue);
        }

        return false;
    }

    private string? GetElementPropertyEditorAlias(Guid contentTypeKey, string propertyAlias) =>
        _contentTypesByKey.TryGetValue(contentTypeKey, out var elementType)
            ? elementType.CompositionPropertyTypes.FirstOrDefault(p => p.Alias == propertyAlias)?.PropertyEditorAlias
            : null;

    // Meganav stored no name for content picks (it was read from the node at render time) and its
    // V8 port could store only the node's int id, so both are looked up while migrating.
    private LegacyContentInfo? ResolveContent(Guid? key, int? id, string? culture)
    {
        IContent? content = key.HasValue ? _contentService.GetById(key.Value)
            : id > 0 ? _contentService.GetById(id.Value)
            : null;

        if (content == null)
        {
            return null;
        }

        var name = culture != null ? content.GetCultureName(culture) : null;
        return new LegacyContentInfo(content.Key, name ?? content.Name);
    }

    private static bool IsNavEditor(string? editorAlias) =>
        editorAlias == UmbNavConstants.PropertyEditorAlias || (editorAlias != null && LegacyEditorAliases.Contains(editorAlias));

    private static bool HasNavProperty(IContentType contentType) =>
        contentType.CompositionPropertyTypes.Any(p => IsNavEditor(p.PropertyEditorAlias));

    private static bool HasBlockProperty(IContentType contentType) =>
        contentType.CompositionPropertyTypes.Any(p => BlockEditorAliases.Contains(p.PropertyEditorAlias));

    // Add this static readonly field to cache the JsonSerializerOptions instance
    private static readonly JsonSerializerOptions CachedJsonSerializerOptions = new JsonSerializerOptions
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    // Item types written by legacy UmbNav. The current editor never writes these, so an item that
    // has none of them (and does have an item type) is already in the current shape.
    private static readonly HashSet<string> LegacyItemTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Link", "Content", "Label", "nolink"
    };

    private static bool IsCurrentItem(JsonObject item) =>
        item["itemType"] is JsonValue value
        && value.TryGetValue<string>(out var itemType)
        && !string.IsNullOrWhiteSpace(itemType)
        && !LegacyItemTypes.Contains(itemType);

    /// <summary>
    /// Whether a stored nav value still holds items in a legacy UmbNav or Meganav shape.
    /// </summary>
    internal static bool IsLegacyValue(string value)
    {
        try
        {
            return JsonNode.Parse(value) is JsonArray items && ContainsLegacyItem(items);
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private static bool ContainsLegacyItem(JsonArray items) =>
        items.OfType<JsonObject>().Any(item =>
            !IsCurrentItem(item) || (item["children"] is JsonArray children && ContainsLegacyItem(children)));

    public static bool TryTransformLegacyValue(ILogger logger, string legacyValue, out string newValue) =>
        TryTransformLegacyValue(logger, legacyValue, null, out newValue);

    /// <summary>
    /// Transforms a legacy UmbNav or Meganav value into the current model. Items already in the
    /// current shape are kept as they are, so values that mix both are only partly rewritten.
    /// </summary>
    internal static bool TryTransformLegacyValue(ILogger logger, string legacyValue, Func<Guid?, int?, LegacyContentInfo?>? resolveContent, out string newValue)
    {
        var items = JsonSerializer.Deserialize<JsonObject[]>(legacyValue);
        if (items == null)
        {
            logger.LogInformation("Unable to deserialise into legacy UmbNavItem");
            newValue = string.Empty;
            return false;
        }

        newValue = TransformItems(items, resolveContent).ToJsonString(CachedJsonSerializerOptions);
        return true;
    }

    private static JsonArray TransformItems(IEnumerable<JsonObject?> items, Func<Guid?, int?, LegacyContentInfo?>? resolveContent)
    {
        var jsonArray = new JsonArray();
        foreach (var item in items.OfType<JsonObject>())
        {
            if (IsCurrentItem(item))
            {
                var current = item.DeepClone().AsObject();
                if (current["children"] is JsonArray children && ContainsLegacyItem(children))
                {
                    current["children"] = TransformItems(children.Select(c => c as JsonObject).ToArray(), resolveContent);
                }
                jsonArray.Add(current);
                continue;
            }

            var oldItem = item.Deserialize<OldUmbNavItem>()!;
            jsonArray.Add(JsonSerializer.SerializeToNode(MapToNewModel(oldItem, resolveContent), CachedJsonSerializerOptions));
        }

        return jsonArray;
    }

    /// <summary>
    /// Walks a block editor value (Block List, Block Grid or a Rich Text value with blocks),
    /// including blocks nested inside blocks, and transforms every legacy nav value it finds.
    /// </summary>
    /// <param name="getEditorAlias">Returns the editor alias of a property on an element type.</param>
    internal static bool TryTransformBlockValue(ILogger logger, string blockValue, Func<Guid, string, string?> getEditorAlias, Func<Guid?, int?, LegacyContentInfo?>? resolveContent, out string newValue)
    {
        newValue = blockValue;

        JsonNode? root;
        try
        {
            root = JsonNode.Parse(blockValue);
        }
        catch (JsonException)
        {
            return false;
        }

        if (root is not JsonObject rootObject || !TransformBlocks(logger, rootObject, getEditorAlias, resolveContent))
        {
            return false;
        }

        newValue = rootObject.ToJsonString();
        return true;
    }

    private static readonly HashSet<string> BlockItemKeys = ["contentTypeKey", "key", "udi", "values"];

    private static bool TransformBlocks(ILogger logger, JsonObject blockValue, Func<Guid, string, string?> getEditorAlias, Func<Guid?, int?, LegacyContentInfo?>? resolveContent)
    {
        var changed = false;

        // Rich text keeps its blocks under "blocks" next to the markup.
        if (blockValue["blocks"] is JsonObject richTextBlocks)
        {
            changed |= TransformBlocks(logger, richTextBlocks, getEditorAlias, resolveContent);
        }

        foreach (var dataKey in new[] { "contentData", "settingsData" })
        {
            if (blockValue[dataKey] is not JsonArray blocks)
            {
                continue;
            }

            foreach (var block in blocks.OfType<JsonObject>())
            {
                if (block["contentTypeKey"] is not JsonValue typeValue || !Guid.TryParse(typeValue.ToString(), out var contentTypeKey))
                {
                    continue;
                }

                // Current storage lists properties under "values"; older storage keeps each
                // property as a key on the block itself. Both are handled.
                if (block["values"] is JsonArray values)
                {
                    foreach (var entry in values.OfType<JsonObject>())
                    {
                        var alias = entry["alias"]?.ToString();
                        if (alias == null)
                        {
                            continue;
                        }

                        var editorAlias = getEditorAlias(contentTypeKey, alias) ?? entry["editorAlias"]?.ToString();
                        changed |= TransformBlockProperty(logger, entry, "value", editorAlias, getEditorAlias, resolveContent);
                    }
                }

                foreach (var propertyAlias in block.Select(p => p.Key).Where(k => !BlockItemKeys.Contains(k)).ToArray())
                {
                    var editorAlias = getEditorAlias(contentTypeKey, propertyAlias);
                    if (editorAlias != null)
                    {
                        changed |= TransformBlockProperty(logger, block, propertyAlias, editorAlias, getEditorAlias, resolveContent);
                    }
                }
            }
        }

        return changed;
    }

    private static bool TransformBlockProperty(ILogger logger, JsonObject owner, string key, string? editorAlias, Func<Guid, string, string?> getEditorAlias, Func<Guid?, int?, LegacyContentInfo?>? resolveContent)
    {
        var node = owner[key];
        if (node == null)
        {
            return false;
        }

        // Nested values are stored either as JSON or as a string holding JSON; write back the same way.
        var isString = node is JsonValue value && value.GetValueKind() == JsonValueKind.String;
        var json = isString ? node.GetValue<string>() : node.ToJsonString();

        if (IsNavEditor(editorAlias))
        {
            if (!IsLegacyValue(json) || !TryTransformLegacyValue(logger, json, resolveContent, out var transformed))
            {
                return false;
            }

            owner[key] = isString ? JsonValue.Create(transformed) : JsonNode.Parse(transformed);
            return true;
        }

        if (!TryTransformBlockValue(logger, json, getEditorAlias, resolveContent, out var transformedBlocks))
        {
            return false;
        }

        owner[key] = isString ? JsonValue.Create(transformedBlocks) : JsonNode.Parse(transformedBlocks);
        return true;
    }

    private static UmbNavItem MapToNewModel(OldUmbNavItem oldItem, Func<Guid?, int?, LegacyContentInfo?>? resolveContent)
    {
        // Title overrides Name if set
        var name = !string.IsNullOrWhiteSpace(oldItem.Title) ? oldItem.Title : oldItem.Name;
        var udi = !string.IsNullOrWhiteSpace(oldItem.Udi) && UdiParser.TryParse(oldItem.Udi, out var parsedUdi) ? parsedUdi as GuidUdi : null;
        var itemType = MapItemType(oldItem.ItemType);
        var isDocument = UmbNavItemType.Is(itemType, UmbNavItemType.Document);

        // Only content backed items keep a content key. Legacy data often left a udi behind on
        // items that were later changed to an external link or a label, and carrying that over
        // makes the renderer resolve the old node and override the item's URL.
        var content = isDocument ? resolveContent?.Invoke(udi?.Guid, oldItem.Id) : null;
        var contentKey = isDocument ? content?.Key ?? udi?.Guid : null;

        // Meganav only stored a title when the editor overrode the node name. A content item
        // left without a name is named from its node, here or by the menu builder at render time.
        name = !string.IsNullOrWhiteSpace(name) ? name : content?.Name;

        // Meganav's hidden items have no direct equivalent, so they are hidden from everyone.
        var hidden = oldItem.Visible == false;

        return new UmbNavItem
        {
            Key = oldItem.Key == Guid.Empty ? Guid.NewGuid() : oldItem.Key,
            Name = name ?? (contentKey.HasValue ? string.Empty : "Unknown Name Set By Migration"),
            Url = oldItem.Url,
            ItemType = itemType,
            ContentKey = contentKey,
            Anchor = oldItem.Anchor,
            Children = oldItem.Children?.Select(c => MapToNewModel(c, resolveContent)),
            Level = oldItem.Level,
            Target = oldItem.Target,
            ImageArray = oldItem.ImageArray,
            CustomClasses = oldItem.CustomClasses,
            HideLoggedIn = hidden || (oldItem.HideLoggedIn ?? false),
            HideLoggedOut = hidden || (oldItem.HideLoggedOut ?? false),
            Noopener = (oldItem.Noopener ?? false).ToString(),
            Noreferrer = (oldItem.Noreferrer ?? false).ToString(),
            IncludeChildNodes = oldItem.IncludeChildNodes ?? false,
            Description = oldItem.Description,
            Icon = oldItem.Icon
        };
    }

    private static string MapItemType(OldUmbNavItemType oldItemType) => oldItemType switch
    {
        OldUmbNavItemType.Link => UmbNavItemType.External,
        OldUmbNavItemType.Content => UmbNavItemType.Document,
        OldUmbNavItemType.Label => UmbNavItemType.Title,
        _ => throw new ArgumentOutOfRangeException(nameof(oldItemType), oldItemType, null),
    };

    private IDataType GenerateUpdatedDataType(IDataType existingType, IDataEditor dataEditor)
    {
        var requestModel = new DataType(dataEditor, _configurationEditorJsonSerializer)
        {
            Id = existingType.Id,
            Name = existingType.Name,
            Key = existingType.Key,
            ParentId = existingType.ParentId,
            EditorUiAlias = dataEditor.Alias,
            // Meganav's configuration (item types, max items) has nothing in common with UmbNav's.
            ConfigurationData = MeganavEditorAliases.Contains(existingType.EditorAlias)
                ? new Dictionary<string, object>()
                : existingType.ConfigurationData,
            CreateDate = existingType.CreateDate,
            UpdateDate = _timeProvider.GetLocalNow().DateTime
        };

        return requestModel;
    }

    // Private class representing the old model
    private class OldUmbNavItem
    {
        [JsonPropertyName("udi")]
        public string? Udi { get; set; }

        [JsonPropertyName("key")]
        public Guid Key { get; set; }

        // Meganav's V8 port could store only the picked node's int id.
        [JsonPropertyName("id")]
        [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
        public int? Id { get; set; }

        // Meganav: false hid the item from the rendered menu.
        [JsonPropertyName("visible")]
        public bool? Visible { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("icon")]
        public string? Icon { get; set; }

        [JsonPropertyName("menuitemdescription")]
        public string? Description { get; set; }

        [JsonPropertyName("target")]
        public string? Target { get; set; }

        // Nullable: the v3.x editor wrote JSON null for unset flags. A non-nullable bool makes
        // System.Text.Json throw on null, which aborted the whole value's conversion.
        [JsonPropertyName("noopener")]
        public bool? Noopener { get; set; }

        [JsonPropertyName("noreferrer")]
        public bool? Noreferrer { get; set; }

        [JsonPropertyName("anchor")]
        public string? Anchor { get; set; }

        [JsonPropertyName("children")]
        public IEnumerable<OldUmbNavItem>? Children { get; set; }        

        [JsonPropertyName("itemType")]
        public string? ItemTypeOriginal { get; set; }
        
        [JsonIgnore]
        public OldUmbNavItemType ItemType {
            get {
                // An explicit type ("Link", "Content", "Label") is what the item was last saved as,
                // so it wins over the udi. Without this, an external link that kept a stale udi from
                // when it pointed at a page would migrate back into a content item. Matched case
                // sensitively so the older generic "link"/"nolink" values fall through below.
                if (Enum.TryParse<OldUmbNavItemType>(ItemTypeOriginal, ignoreCase: false, out var explicitType))
                {
                    return explicitType;
                }

                var hasContentUdi = !string.IsNullOrWhiteSpace(Udi) && UdiParser.TryParse(Udi, out _);

                if (ItemTypeOriginal.IsNullOrWhiteSpace())
                {
                    // Oldest data (and Meganav) carries no item type at all, so the udi or the
                    // node id is the only signal.
                    if (hasContentUdi || Id > 0)
                    {
                        return OldUmbNavItemType.Content;
                    }

                    return Url.IsNullOrWhiteSpace() ? OldUmbNavItemType.Label : OldUmbNavItemType.Link;
                }

                return ItemTypeOriginal.ToLowerInvariant() switch
                {
                    // The generic "link" type was used for content picks too, so the udi decides.
                    "link" => hasContentUdi ? OldUmbNavItemType.Content : OldUmbNavItemType.Link,
                    "nolink" => OldUmbNavItemType.Label,
                    _ => throw new ArgumentOutOfRangeException(nameof(ItemTypeOriginal), ItemTypeOriginal, null)
                };
            }
        }

        [JsonIgnore]
        public int Level { get; set; }

        [JsonPropertyName("hideLoggedIn")]
        public bool? HideLoggedIn { get; set; }

        [JsonPropertyName("hideLoggedOut")]
        public bool? HideLoggedOut { get; set; }

        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("includeChildNodes")]
        public bool? IncludeChildNodes { get; set; }

        [JsonPropertyName("customClasses")]
        public string? CustomClasses { get; set; }

        [JsonPropertyName("image")]
        public ImageItem[]? ImageArray { get; set; }
    }

    private enum OldUmbNavItemType
    {
        Link = 0,
        Content = 1,
        Label = 2
    }
}
