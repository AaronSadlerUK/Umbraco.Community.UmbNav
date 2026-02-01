using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using Moq;
using Moq.Protected;
using System.Net;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Configuration;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Manifest;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Semver;
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Community.UmbNav.Core.NotificationHandlers;

namespace Umbraco.Community.UmbNav.Core.Tests.NotificationHandlers;

public class TelemetryNotificationHandlerTests
{
    private readonly Mock<IHttpClientFactory> _httpClientFactoryMock;
    private readonly Mock<IUmbracoVersion> _umbracoVersionMock;
    private readonly Mock<IWebHostEnvironment> _webHostEnvironmentMock;
    private readonly Mock<IRuntimeState> _runtimeStateMock;
    private readonly Mock<IKeyValueService> _keyValueServiceMock;
    private readonly Mock<IPackageManifestService> _packageManifestServiceMock;
    private readonly IOptions<GlobalSettings> _globalSettings;
    private readonly IOptions<UmbNavAppSettings> _umbNavAppSettings;

    public TelemetryNotificationHandlerTests()
    {
        _httpClientFactoryMock = new Mock<IHttpClientFactory>();
        _umbracoVersionMock = new Mock<IUmbracoVersion>();
        _webHostEnvironmentMock = new Mock<IWebHostEnvironment>();
        _runtimeStateMock = new Mock<IRuntimeState>();
        _keyValueServiceMock = new Mock<IKeyValueService>();
        _packageManifestServiceMock = new Mock<IPackageManifestService>();

        _globalSettings = Options.Create(new GlobalSettings { Id = Guid.NewGuid().ToString() });
        _umbNavAppSettings = Options.Create(new UmbNavAppSettings { DisableTelemetry = false });

        _runtimeStateMock.Setup(x => x.Level).Returns(RuntimeLevel.Run);
    }

    [Fact]
    public async Task HandleAsync_WithDisableTelemetry_DoesNotSendRequest()
    {
        var settings = Options.Create(new UmbNavAppSettings { DisableTelemetry = true });

        var handler = new TelemetryNotificationHandler(
            _globalSettings,
            settings,
            _httpClientFactoryMock.Object,
            _umbracoVersionMock.Object,
            _webHostEnvironmentMock.Object,
            _runtimeStateMock.Object,
            _keyValueServiceMock.Object,
            _packageManifestServiceMock.Object);

        var notification = new UmbracoApplicationStartedNotification(false);

        await handler.HandleAsync(notification, CancellationToken.None);

        _httpClientFactoryMock.Verify(x => x.CreateClient(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_WithRuntimeLevelBelowRun_DoesNotSendRequest()
    {
        _runtimeStateMock.Setup(x => x.Level).Returns(RuntimeLevel.Install);

        var handler = new TelemetryNotificationHandler(
            _globalSettings,
            _umbNavAppSettings,
            _httpClientFactoryMock.Object,
            _umbracoVersionMock.Object,
            _webHostEnvironmentMock.Object,
            _runtimeStateMock.Object,
            _keyValueServiceMock.Object,
            _packageManifestServiceMock.Object);

        var notification = new UmbracoApplicationStartedNotification(false);

        await handler.HandleAsync(notification, CancellationToken.None);

        _httpClientFactoryMock.Verify(x => x.CreateClient(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_WithEmptyGlobalId_DoesNotSendRequest()
    {
        var settings = Options.Create(new GlobalSettings { Id = Guid.Empty.ToString() });

        var version = new SemVersion(14, 0, 0);
        _umbracoVersionMock.Setup(x => x.SemanticVersion).Returns(version);
        _webHostEnvironmentMock.Setup(x => x.EnvironmentName).Returns("Production");

        var manifests = new List<PackageManifest>
        {
            new() { Name = UmbNavConstants.PropertyEditorAlias, Version = "1.0.0", Extensions = [] }
        };
        _packageManifestServiceMock.Setup(x => x.GetAllPackageManifestsAsync())
            .ReturnsAsync(manifests);

        var handler = new TelemetryNotificationHandler(
            settings,
            _umbNavAppSettings,
            _httpClientFactoryMock.Object,
            _umbracoVersionMock.Object,
            _webHostEnvironmentMock.Object,
            _runtimeStateMock.Object,
            _keyValueServiceMock.Object,
            _packageManifestServiceMock.Object);

        var notification = new UmbracoApplicationStartedNotification(false);

        await handler.HandleAsync(notification, CancellationToken.None);

        _httpClientFactoryMock.Verify(x => x.CreateClient(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_WithNoUmbNavVersion_DoesNotSendRequest()
    {
        var version = new SemVersion(14, 0, 0);
        _umbracoVersionMock.Setup(x => x.SemanticVersion).Returns(version);
        _webHostEnvironmentMock.Setup(x => x.EnvironmentName).Returns("Production");

        var manifests = new List<PackageManifest>
        {
            new() { Name = "SomeOtherPackage", Version = "1.0.0", Extensions = [] }
        };
        _packageManifestServiceMock.Setup(x => x.GetAllPackageManifestsAsync())
            .ReturnsAsync(manifests);

        var handler = new TelemetryNotificationHandler(
            _globalSettings,
            _umbNavAppSettings,
            _httpClientFactoryMock.Object,
            _umbracoVersionMock.Object,
            _webHostEnvironmentMock.Object,
            _runtimeStateMock.Object,
            _keyValueServiceMock.Object,
            _packageManifestServiceMock.Object);

        var notification = new UmbracoApplicationStartedNotification(false);

        await handler.HandleAsync(notification, CancellationToken.None);

        _httpClientFactoryMock.Verify(x => x.CreateClient(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_WithMatchingStoredValue_DoesNotSendRequest()
    {
        var version = new SemVersion(14, 0, 0);
        _umbracoVersionMock.Setup(x => x.SemanticVersion).Returns(version);
        _webHostEnvironmentMock.Setup(x => x.EnvironmentName).Returns("Production");

        var manifests = new List<PackageManifest>
        {
            new() { Name = UmbNavConstants.PropertyEditorAlias, Version = "1.0.0", Extensions = [] }
        };
        _packageManifestServiceMock.Setup(x => x.GetAllPackageManifestsAsync())
            .ReturnsAsync(manifests);

        _keyValueServiceMock.Setup(x => x.GetValue(UmbNavConstants.TelemetryKey))
            .Returns("1.0.0_14.0.0_Production");

        var handler = new TelemetryNotificationHandler(
            _globalSettings,
            _umbNavAppSettings,
            _httpClientFactoryMock.Object,
            _umbracoVersionMock.Object,
            _webHostEnvironmentMock.Object,
            _runtimeStateMock.Object,
            _keyValueServiceMock.Object,
            _packageManifestServiceMock.Object);

        var notification = new UmbracoApplicationStartedNotification(false);

        await handler.HandleAsync(notification, CancellationToken.None);

        _httpClientFactoryMock.Verify(x => x.CreateClient(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_OnException_DoesNotThrow()
    {
        var version = new SemVersion(14, 0, 0);
        _umbracoVersionMock.Setup(x => x.SemanticVersion).Returns(version);
        _webHostEnvironmentMock.Setup(x => x.EnvironmentName).Returns("Production");

        var manifests = new List<PackageManifest>
        {
            new() { Name = UmbNavConstants.PropertyEditorAlias, Version = "1.0.0", Extensions = [] }
        };
        _packageManifestServiceMock.Setup(x => x.GetAllPackageManifestsAsync())
            .ReturnsAsync(manifests);

        _keyValueServiceMock.Setup(x => x.GetValue(UmbNavConstants.TelemetryKey))
            .Throws(new Exception("Database error"));

        var handler = new TelemetryNotificationHandler(
            _globalSettings,
            _umbNavAppSettings,
            _httpClientFactoryMock.Object,
            _umbracoVersionMock.Object,
            _webHostEnvironmentMock.Object,
            _runtimeStateMock.Object,
            _keyValueServiceMock.Object,
            _packageManifestServiceMock.Object);

        var notification = new UmbracoApplicationStartedNotification(false);

        // Should not throw
        await handler.HandleAsync(notification, CancellationToken.None);

        Assert.True(true);
    }
}
