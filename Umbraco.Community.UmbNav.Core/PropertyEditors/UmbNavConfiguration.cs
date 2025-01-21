using Umbraco.Cms.Core.PropertyEditors;

namespace Umbraco.Community.UmbNav.Core.PropertyEditors
{
    public class UmbNavConfiguration
    {
        [ConfigurationField("enableTextItems")]
        public bool EnableTextItems { get; set; }

        [ConfigurationField("enableToggleAllButton")]
        public bool EnableToggleAllButton { get; set; }

        [ConfigurationField("allowImageIcon")]
        public bool AllowImageIcon { get; set; }

        [ConfigurationField("allowCustomClasses")]
        public bool AllowCustomClasses { get; set; }

        [ConfigurationField("allowDisplay")]
        public bool AllowDisplay { get; set; }

        [ConfigurationField("hideNoopener")]
        public bool HideNoopener { get; set; }

        [ConfigurationField("hideNoreferrer")]
        public bool HideNoreferrer { get; set; }
    }
}
