using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Models;
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

internal sealed class UmbNavLegacyModelMigration : AsyncPackageMigrationBase
{
    private readonly ILogger<UmbNavLegacyModelMigration> _logger;
    private readonly IContentTypeService _contentTypeService;
    private readonly IContentService _contentService;
    private readonly IDataTypeService _dataTypeService;
    private readonly PropertyEditorCollection _propertyEditorCollection;
    private readonly IConfigurationEditorJsonSerializer _configurationEditorJsonSerializer;
    private readonly IMigrationContext _migrationContext;
    private readonly TimeProvider _timeProvider;

    public UmbNavLegacyModelMigration(ILogger<UmbNavLegacyModelMigration> logger, IContentTypeService contentTypeService, IContentService contentService, IDataTypeService dataTypeService, PropertyEditorCollection propertyEditorCollection, IConfigurationEditorJsonSerializer configurationEditorJsonSerializer, TimeProvider timeProvider, IPackagingService packagingService, IMediaService mediaService, MediaFileManager mediaFileManager, MediaUrlGeneratorCollection mediaUrlGenerators, IShortStringHelper shortStringHelper, IContentTypeBaseServiceProvider contentTypeBaseServiceProvider, IMigrationContext context, IOptions<PackageMigrationSettings> packageMigrationsSettings) : base(packagingService, mediaService, mediaFileManager, mediaUrlGenerators, shortStringHelper, contentTypeBaseServiceProvider, context, packageMigrationsSettings)
    {
        _logger = logger;
        _contentTypeService = contentTypeService;
        _contentService = contentService;
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

        var dataTypes = (await _dataTypeService.GetByEditorAliasAsync(UmbNavConstants.LegacyEditorAlias)).ToArray();

        if (dataTypes.Length == 0)
        {
            if (_logger.IsEnabled(LogLevel.Information))
            {
                _logger.LogInformation("No instances of legacy UmbNav data types found.");
                return;
            }
        }

        if(!_propertyEditorCollection.TryGet(UmbNavConstants.PropertyEditorAlias, out IDataEditor? dataEditor) || dataEditor == null)
        {
            if (_logger.IsEnabled(LogLevel.Information))
            {
                _logger.LogInformation("Could not find new UmbNav data editor");
                return;
            }
        }

        bool hadContentToMigrate = MigrateLegacyContent();
        if (!hadContentToMigrate)
        {
            if (_logger.IsEnabled(LogLevel.Information))
            {
                _logger.LogInformation("No content types found with the legacy UmbNav property editor.");
            }
            return;
        }

        foreach (IDataType datatype in dataTypes)
        {
            Attempt<IDataType, DataTypeOperationStatus> result = await _dataTypeService.UpdateAsync(GenerateUpdatedDataType(datatype, dataEditor!), Constants.Security.SuperUserKey);
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

    private bool MigrateLegacyContent()
    {
        var contentTypes = _contentTypeService.GetAll()
                    .Where(ct => ct.PropertyTypes.Any(p => p.PropertyEditorAlias == UmbNavConstants.LegacyEditorAlias) ||
                        ct.CompositionPropertyTypes.Any(cp => cp.PropertyEditorAlias == UmbNavConstants.LegacyEditorAlias)).ToArray();

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
                ProcessContentType(contentType);
            }
        }

        return true;
    }

    private void ProcessContentType(IContentType contentType)
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
                    var saveContent = false;
                    foreach (var property in content.Properties)
                    {
                        if (property.PropertyType.PropertyEditorAlias == UmbNavConstants.LegacyEditorAlias)
                        {
                            var legacyValue = property.GetValue()?.ToString();
                            if (!string.IsNullOrWhiteSpace(legacyValue))
                            {
                                try
                                {
                                    // Example transformation logic; adjust as needed
                                    var hasTransformed = TryTransformLegacyValue(_logger, legacyValue, out var newValue);
                                    if (hasTransformed)
                                    {
                                        property.SetValue(newValue);
                                        saveContent = true;
                                    }
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex, "Something went wrong migrating legacy content.{legacyValue}", legacyValue);
                                }

                            }
                        }
                    }

                    if (saveContent)
                    {
                        _contentService.Save(content);
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

    // Add this static readonly field to cache the JsonSerializerOptions instance
    private static readonly JsonSerializerOptions CachedJsonSerializerOptions = new JsonSerializerOptions
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter() }
    };

    public static bool TryTransformLegacyValue(ILogger logger, string legacyValue, out string newValue)
    {
        var oldItems = JsonSerializer.Deserialize<IEnumerable<OldUmbNavItem>>(legacyValue);
        if (oldItems == null)
        {
            logger.LogInformation("Unable to deserialise into legacy UmbNavItem");
            newValue = string.Empty;
            return false;
        }

        var newItems = oldItems.Select(MapToNewModel).ToList();

        var jsonArray = new JsonArray();
        foreach (var item in newItems)
        {
            // Use the cached options instead of creating a new instance every time
            var node = JsonSerializer.SerializeToNode(item, CachedJsonSerializerOptions)!.AsObject();
            jsonArray.Add(node);
        }

        // (Assuming you want to output the serialized array as a string)
        newValue = jsonArray.ToJsonString(CachedJsonSerializerOptions);
        return true;
    }

    private static UmbNavItem MapToNewModel(OldUmbNavItem oldItem, int level = 0)
    {
        // Title overrides Name if set
        var name = !string.IsNullOrWhiteSpace(oldItem.Title) ? oldItem.Title : oldItem.Name;
        var udi = !string.IsNullOrWhiteSpace(oldItem.Udi) && UdiParser.TryParse(oldItem.Udi, out var parsedUdi) ? parsedUdi as GuidUdi : null;
        return new UmbNavItem
        {
            Key = oldItem.Key == Guid.Empty ? Guid.NewGuid() : oldItem.Key,
            Name = name ?? "Unknown Name Set By Migration",
            Url = oldItem.Url,
            ItemType = MapItemType(oldItem.ItemType),
            ContentKey = udi?.Guid,
            Anchor = oldItem.Anchor,
            Children = oldItem.Children?.Select(c => MapToNewModel(c, level + 1)),
            Level = oldItem.Level,
            Target = oldItem.Target,
            ImageArray = oldItem.ImageArray,
            CustomClasses = oldItem.CustomClasses,
            HideLoggedIn = oldItem.HideLoggedIn,
            HideLoggedOut = oldItem.HideLoggedOut,
            Noopener = oldItem.Noopener.ToString(),
            Noreferrer = oldItem.Noreferrer.ToString(),
            IncludeChildNodes = oldItem.IncludeChildNodes,
            Description = oldItem.Description,
            Icon = oldItem.Icon
        };
    }

    private static UmbNavItemType MapItemType(OldUmbNavItemType oldItemType) => oldItemType switch
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
            ConfigurationData = existingType.ConfigurationData,
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

        [JsonPropertyName("noopener")]
        public bool Noopener { get; set; }

        [JsonPropertyName("noreferrer")]
        public bool Noreferrer { get; set; }

        [JsonPropertyName("anchor")]
        public string? Anchor { get; set; }

        [JsonPropertyName("children")]
        public IEnumerable<OldUmbNavItem>? Children { get; set; }        

        [JsonPropertyName("itemType")]
        public string? ItemTypeOriginal { get; set; }
        
        [JsonIgnore]
        public OldUmbNavItemType ItemType { 
            get {
                if (ItemTypeOriginal.IsNullOrWhiteSpace())
                {
                    return Url.IsNullOrWhiteSpace() ? OldUmbNavItemType.Label : OldUmbNavItemType.Link;
                }

                return ItemTypeOriginal.ToLowerInvariant() switch
                {
                    "link" => !string.IsNullOrWhiteSpace(Udi) && UdiParser.TryParse(Udi, out _) ? OldUmbNavItemType.Content : OldUmbNavItemType.Link,
                    "nolink" => OldUmbNavItemType.Label,
                    _ => Enum.TryParse<OldUmbNavItemType>(ItemTypeOriginal, out var res) ? res : throw new ArgumentOutOfRangeException(nameof(ItemTypeOriginal), ItemTypeOriginal, null)
                };
            }
        }

        [JsonIgnore]
        public int Level { get; set; }

        [JsonPropertyName("hideLoggedIn")]
        public bool HideLoggedIn { get; set; }

        [JsonPropertyName("hideLoggedOut")]
        public bool HideLoggedOut { get; set; }

        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("includeChildNodes")]
        public bool IncludeChildNodes { get; set; }

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
