using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;
using System.Net.Mime;
using System.Text;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Configuration;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Extensions;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Manifest;
using Umbraco.Cms.Core.Services;

namespace Umbraco.Community.UmbNav.Core.NotificationHandlers
{
    internal sealed class TelemetryNotificationHandler : INotificationAsyncHandler<UmbracoApplicationStartedNotification>
    {
        private readonly GlobalSettings _globalSettings;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IUmbracoVersion _umbracoVersion;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly UmbNavAppSettings _umbNavAppSettings;
        private readonly IRuntimeState _runtimeState;
        private readonly IKeyValueService _keyValueService;
        private readonly IPackageManifestService _packageManifestService;

        public TelemetryNotificationHandler(IOptions<GlobalSettings> globalSettings, IOptions<UmbNavAppSettings> umbNavAppSettings, IHttpClientFactory httpClientFactory, IUmbracoVersion umbracoVersion, IWebHostEnvironment webHostEnvironment, IRuntimeState runtimeState, IKeyValueService keyValueService, IPackageManifestService packageManifestService)
        {
            _globalSettings = globalSettings.Value;
            _httpClientFactory = httpClientFactory;
            _umbracoVersion = umbracoVersion;
            _webHostEnvironment = webHostEnvironment;
            _runtimeState = runtimeState;
            _keyValueService = keyValueService;
            _packageManifestService = packageManifestService;
            _umbNavAppSettings = umbNavAppSettings.Value;
        }

        public async Task HandleAsync(UmbracoApplicationStartedNotification notification, CancellationToken cancellationToken)
        {
            await PingTelemetryServer(cancellationToken);
        }

        private async Task PingTelemetryServer(CancellationToken cancellationToken)
        {
            if (_runtimeState.Level < RuntimeLevel.Run)
            {
                return;
            }

            try
            {
                if (_umbNavAppSettings.DisableTelemetry)
                {
                    return;
                }
                var umbracoVersion = _umbracoVersion.SemanticVersion.ToSemanticStringWithoutBuild();
                var environmentName = _webHostEnvironment.EnvironmentName;

                var manifests = await _packageManifestService.GetAllPackageManifestsAsync();
                var umbNavVersion = manifests.FirstOrDefault(x => x.Name.Equals(UmbNavConstants.PropertyEditorAlias))?.Version;

                if (string.IsNullOrWhiteSpace(umbNavVersion))
                {
                    return;
                }

                var currentValue = _keyValueService.GetValue(UmbNavConstants.TelemetryKey);

                if (!string.IsNullOrWhiteSpace(currentValue) && currentValue.Equals($"{umbNavVersion}_{umbracoVersion}_{environmentName}"))
                {
                    return;
                }

                var umbracoId = Guid.TryParse(_globalSettings.Id, out var telemetrySiteIdentifier)
                    ? telemetrySiteIdentifier
                    : Guid.Empty;

                if (umbracoId.Equals(Guid.Empty))
                {
                    return;
                }

                var data = new
                {
                    umbracoId,
                    umbracoVersion,
                    umbNavVersion,
                    environmentName
                };

                var json = JsonConvert.SerializeObject(data, Formatting.None);
                var base64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
                var payload = new StringContent(base64, Encoding.UTF8, MediaTypeNames.Application.Json);
                var address = new Uri(UmbNavConstants.TelemetryUrl);

                using var client = _httpClientFactory.CreateClient();
                using var post = await client.PostAsync(address, payload, cancellationToken);

                if (post.IsSuccessStatusCode)
                {
                    _keyValueService.SetValue(UmbNavConstants.TelemetryKey, $"{umbNavVersion}_{umbracoVersion}_{environmentName}");
                }
            }
            catch (Exception)
            {
                // ignored
            }
        }
    }
}
