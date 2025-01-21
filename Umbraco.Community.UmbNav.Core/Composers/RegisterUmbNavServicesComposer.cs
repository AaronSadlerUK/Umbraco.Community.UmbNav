using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Services;
using Umbraco.Extensions;

namespace Umbraco.Community.UmbNav.Core.Composers
{
    public class RegisterUmbNavServicesComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddUnique<IUmbNavMenuBuilderService, UmbNavMenuBuilderService>();

        }
    }
}
