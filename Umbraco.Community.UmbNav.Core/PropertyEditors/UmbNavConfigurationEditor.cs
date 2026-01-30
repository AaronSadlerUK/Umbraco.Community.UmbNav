using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;

namespace Umbraco.Community.UmbNav.Core.PropertyEditors;

/// <summary>
/// Configuration editor for the UmbNav property editor.
/// This class can be extended to customize configuration handling.
/// </summary>
public class UmbNavConfigurationEditor : ConfigurationEditor<UmbNavConfiguration>
{
    public UmbNavConfigurationEditor(IIOHelper ioHelper)
        : base(ioHelper)
    {
    }
}
