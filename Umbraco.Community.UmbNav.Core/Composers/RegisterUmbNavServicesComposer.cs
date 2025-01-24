using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Community.UmbNav.Core.NotificationHandlers;
using Umbraco.Community.UmbNav.Core.Services;
using Umbraco.Extensions;

namespace Umbraco.Community.UmbNav.Core.Composers
{
    public class RegisterUmbNavServicesComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.Configure<UmbNavAppSettings>(builder.Config.GetSection("UmbNav"));
            builder.AddNotificationAsyncHandler<UmbracoApplicationStartedNotification, TelemetryNotificationHandler>();
            builder.Services.AddUnique<IUmbNavMenuBuilderService, UmbNavMenuBuilderService>();
        }
    }
}
