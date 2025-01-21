using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;

namespace Umbraco.Community.UmbNav.Core.PropertyEditors;

internal class UmbNavConfigurationEditor : ConfigurationEditor<UmbNavConfiguration>
{
    public UmbNavConfigurationEditor(IIOHelper ioHelper)
        : base(ioHelper)
    {
    }
}
