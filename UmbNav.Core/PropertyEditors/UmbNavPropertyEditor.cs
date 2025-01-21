using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.IO;

namespace UmbNav.Core.PropertyEditors;

[DataEditor(UmbNavConstants.PropertyEditorAlias, ValueType = ValueTypes.Json, ValueEditorIsReusable = true)]
public class UmbNavPropertyEditor : DataEditor
{
    private readonly IIOHelper _ioHelper;
    public UmbNavPropertyEditor(IDataValueEditorFactory dataValueEditorFactory, IIOHelper ioHelper)
        : base(dataValueEditorFactory)
    {
        _ioHelper = ioHelper;
    }

    protected override IConfigurationEditor CreateConfigurationEditor() => new UmbNavConfigurationEditor(_ioHelper);
}