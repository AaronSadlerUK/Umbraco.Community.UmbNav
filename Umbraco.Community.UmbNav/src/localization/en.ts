import type { UmbLocalizationDictionary } from '@umbraco-cms/backoffice/localization-api';

export default {
	umbnav: {
        addTextItemModalHeadline: 'Add Text Item',
        addTextItemToggleButton: 'Add Text Item',
        editMenuItemModalHeadline: 'Edit Menu Item',
        toggleItemModalVisibilityHeadline: 'Toggle Item Visibility',
        addLinkItemToggleButton: 'Add Link Item',
        deleteItemModalHeadline: (name) => `Delete ${name}`,
        deleteItemModalContent: (name) => `Are you sure you want to delete the "${name}" menu item?`,
        deleteItemModalConfirmLabel: 'Delete',
        toggleAllItemsToggleButton: 'Toggle All Items',
        buttonsImage: 'Image',
        buttonsSettings: 'Settings',
        buttonsVisibility: 'Visibility',
        buttonsEdit: 'Edit',
        buttonsDelete: 'Delete',
        settingsEnableTextItemsLabel: 'Enable Text Items',
        settingsEnableTextItemsDescription: 'If enabled, text items can be added to the navigation.',
        settingsEnableToggleAllButtonLabel: 'Enable Toggle All Items Button',
        settingsEnableToggleAllButtonDescription: 'If enabled, a button will be displayed to toggle all items.',
        settingsAllowImageIconLabel: 'Allow Image / Icon URL',
        settingsAllowImageIconDescription: 'Allow the ability to pick an image for the navigation item.',
        settingsAllowCustomClassesLabel: 'Allow Custom Classes',
        settingsAllowCustomClassesDescription: 'Allow the ability to set custom classes on an item.',
        settingsAllowDisplayLabel: 'Allow Member Visibility',
        settingsAllowDisplayDescription: 'Allow the ability to hide menu items based on member authentication status.',
        settingsHideNoopenerLabel: 'Hide noopener Toggle',
        settingsHideNoopenerDescription: 'Hide the ability to toggle noopener.',
        settingsHideNoreferrerLabel: 'Hide noreferrer Toggle',
        settingsHideNoreferrerDescription: 'Hide the ability to toggle noreferrer.',
        settingsMaxDepthLabel: 'Max Depth',
        settingsMaxDepthDescription: 'The maximum depth of the navigation tree.'
    }
} as UmbLocalizationDictionary;