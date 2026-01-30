import { ManifestPropertyEditorSchema, ManifestPropertyEditorUi } from '@umbraco-cms/backoffice/property-editor';

const umbNavPropertyEditorUiManifest: ManifestPropertyEditorUi = {
    type: 'propertyEditorUi',
    alias: 'Umbraco.Community.UmbNav',
    name: 'UmbNav',
    element: () => import('./components/umbnav-property-editor-ui/umbnav-property-editor-ui'),
    elementName: "umbnav-property-editor-ui",
    meta: {
         label : "UmbNav",
         icon : "icon-sitemap",
         group : "pickers",
         propertyEditorSchemaAlias : "Umbraco.Community.UmbNav",
         settings : {
             properties : [
                {
                     alias : "enableTextItems",
                     label : "#umbnav_settingsEnableTextItemsLabel",
                     description : "{#umbnav_settingsEnableTextItemsDescription}",
                     propertyEditorUiAlias : "Umb.PropertyEditorUi.Toggle"
                },
                {
                     alias : "enableToggleAllButton",
                     label : "#umbnav_settingsEnableToggleAllButtonLabel",
                     description : "{#umbnav_settingsEnableToggleAllButtonDescription}",
                     propertyEditorUiAlias : "Umb.PropertyEditorUi.Toggle"
                },
                {
                     alias : "allowImageIcon",
                     label : "#umbnav_settingsAllowImageIconLabel",
                     description : "{#umbnav_settingsAllowImageIconDescription}",
                     propertyEditorUiAlias : "Umb.PropertyEditorUi.Toggle"
                },
                {
                     alias : "allowCustomClasses",
                     label : "#umbnav_settingsAllowCustomClassesLabel",
                     description : "{#umbnav_settingsAllowCustomClassesDescription}",
                     propertyEditorUiAlias : "Umb.PropertyEditorUi.Toggle"
                },
                {
                     alias : "allowDisplay",
                     label : "#umbnav_settingsAllowDisplayLabel",
                     description : "{#umbnav_settingsAllowDisplayDescription}",
                     propertyEditorUiAlias : "Umb.PropertyEditorUi.Toggle"
                },
                {
                     alias : "hideNoopener",
                     label : "#umbnav_settingsHideNoopenerLabel",
                     description : "{#umbnav_settingsHideNoopenerDescription}",
                     propertyEditorUiAlias : "Umb.PropertyEditorUi.Toggle"
                },
                {
                     alias : "hideNoreferrer",
                     label : "#umbnav_settingsHideNoreferrerLabel",
                     description : "{#umbnav_settingsHideNoreferrerDescription}",
                     propertyEditorUiAlias : "Umb.PropertyEditorUi.Toggle"
                },
                 {
                     alias : "maxDepth",
                     label : "#umbnav_settingsMaxDepthLabel",
                     description : "{#umbnav_settingsMaxDepthDescription}",
                     propertyEditorUiAlias : "Umb.PropertyEditorUi.Integer"
                 },
               {
                     alias : "hideIncludeChildren",
                     label : "#umbnav_settingsHideIncludeChildrenLabel",
                     description : "{#umbnav_settingsHideIncludeChildrenDescription}",
                     propertyEditorUiAlias : "Umb.PropertyEditorUi.Toggle"
                 },
                {
                     alias : "allowDescription",
                     label : "#umbnav_settingsAllowDescriptionLabel",
                     description : "{#umbnav_settingsAllowDescriptionDescription}",
                     propertyEditorUiAlias : "Umb.PropertyEditorUi.Toggle"
                 }
            ],
             defaultData : [
                {
                     alias : "enableTextItems",
                     value : true
                },
                {
                     alias : "enableToggleAllButton",
                     value : true
                },
                {
                     alias : "allowImageIcon",
                     value : true
                },
                {
                     alias : "allowCustomClasses",
                     value : false
                },
                {
                     alias : "allowDisplay",
                     value : false
                },
                {
                     alias : "hideNoopener",
                     value : false
                },
                {
                     alias : "hideNoreferrer",
                     value : false
                },
                 {
                     alias : "maxDepth",
                     value : 0
                 },
                {
                     alias : "hideIncludeChildren",
                     value : false
                 },
                {
                     alias : "allowDescription",
                     value : false
                 }
            ]
        }
    }
};
export const styledTextSchema : ManifestPropertyEditorSchema = {
    type: 'propertyEditorSchema',
    name: 'UmbNav Schema',
    alias: 'umbnav.editor.schema',
    meta: {
        defaultPropertyEditorUiAlias: 'Umbraco.Plain.Json'
    }
};
export const manifests = [umbNavPropertyEditorUiManifest, styledTextSchema];