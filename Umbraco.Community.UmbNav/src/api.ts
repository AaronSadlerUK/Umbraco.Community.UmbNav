/**
 * UmbNav Public API
 *
 * This module exports all public APIs for extending and customizing UmbNav.
 * Import from this file when building extensions:
 *
 * @example
 * ```typescript
 * import { UmbNavExtensionRegistry, UmbNavItem } from '@umbraco-community/umbnav/api';
 * ```
 */

// Export extension system for external customization
export * from './extensions/index.js';

// Export types for type-safe extension development
export type { ModelEntryType, Guid, GuidUdi, UmbNavLinkPickerLinkType, ImageItem } from './tokens/umbnav.token.js';

// Export components for extension/subclassing
export { UmbNavItem, UmbNavToolbarActionEvent } from './components/umbnav-item/umbnav-item.js';
export { UmbNavGroup } from './components/umbnav-group/umbnav-group.js';
export { default as UmbNavSorterPropertyEditorUIElement } from './components/umbnav-property-editor-ui/umbnav-property-editor-ui.js';

// Export modal tokens for custom modal integration
export { UMBNAV_TEXT_ITEM_MODAL, type UmbNavTextItemModalData } from './tokens/text-item-modal-token.js';
export { UMBNAV_SETTINGS_ITEM_MODAL, type UmbNavSettingsItemModalData, type UmbNavSettingsItem } from './tokens/settings-item-modal-token.js';
export { UMBNAV_VISIBILITY_ITEM_MODAL, type UmbNavVisibilityItemModalData, type UmbNavItemVisibility } from './tokens/visibility-item-modal-token.js';

// Export utilities for extension development
export * from './umbnav-utils.js';

// Export styles for style composition
export { UmbNavItemStyles } from './components/umbnav-item/umbnav-item.styles.js';
export { UmbNavGroupStyles } from './components/umbnav-group/umbnav-group.styles.js';
export { UmbNavPropertyEditorUIStyles } from './components/umbnav-property-editor-ui/umbnav-property-editor-ui.styles.js';
