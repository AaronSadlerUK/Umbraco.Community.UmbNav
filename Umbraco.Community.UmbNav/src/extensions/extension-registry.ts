import {
    UmbNavToolbarAction,
    UmbNavModalRegistration,
    UmbNavItemTypeRegistration,
    UmbNavItemSlot
} from './extension-types.js';

/**
 * Registry for UmbNav extensions.
 * Use this to register custom toolbar actions, modals, item types, and slots.
 *
 * @example
 * ```typescript
 * import { UmbNavExtensionRegistry } from '@umbraco-community/umbnav';
 *
 * // Register a custom toolbar action
 * UmbNavExtensionRegistry.registerToolbarAction({
 *     alias: 'my-custom-action',
 *     label: 'My Action',
 *     icon: 'icon-star',
 *     onExecute: (item, context) => {
 *         console.log('Action executed on', item);
 *     }
 * });
 * ```
 */
class UmbNavExtensionRegistryClass {
    private _toolbarActions: Map<string, UmbNavToolbarAction> = new Map();
    private _modals: Map<string, UmbNavModalRegistration> = new Map();
    private _itemTypes: Map<string, UmbNavItemTypeRegistration> = new Map();
    private _itemSlots: Map<string, UmbNavItemSlot> = new Map();
    private _changeCallbacks: Set<() => void> = new Set();

    /**
     * Register a custom toolbar action.
     */
    registerToolbarAction(action: UmbNavToolbarAction): void {
        this._toolbarActions.set(action.alias, action);
        this._notifyChange();
    }

    /**
     * Unregister a toolbar action by alias.
     */
    unregisterToolbarAction(alias: string): boolean {
        const result = this._toolbarActions.delete(alias);
        if (result) this._notifyChange();
        return result;
    }

    /**
     * Get all registered toolbar actions.
     */
    getToolbarActions(): UmbNavToolbarAction[] {
        return Array.from(this._toolbarActions.values());
    }

    /**
     * Get a toolbar action by alias.
     */
    getToolbarAction(alias: string): UmbNavToolbarAction | undefined {
        return this._toolbarActions.get(alias);
    }

    /**
     * Register a custom modal.
     */
    registerModal(modal: UmbNavModalRegistration): void {
        this._modals.set(modal.alias, modal);
        this._notifyChange();
    }

    /**
     * Unregister a modal by alias.
     */
    unregisterModal(alias: string): boolean {
        const result = this._modals.delete(alias);
        if (result) this._notifyChange();
        return result;
    }

    /**
     * Get all registered modals.
     */
    getModals(): UmbNavModalRegistration[] {
        return Array.from(this._modals.values());
    }

    /**
     * Get a modal by alias.
     */
    getModal(alias: string): UmbNavModalRegistration | undefined {
        return this._modals.get(alias);
    }

    /**
     * Register a custom item type.
     */
    registerItemType(itemType: UmbNavItemTypeRegistration): void {
        this._itemTypes.set(itemType.type, itemType);
        this._notifyChange();
    }

    /**
     * Unregister an item type.
     */
    unregisterItemType(type: string): boolean {
        const result = this._itemTypes.delete(type);
        if (result) this._notifyChange();
        return result;
    }

    /**
     * Get all registered item types.
     */
    getItemTypes(): UmbNavItemTypeRegistration[] {
        return Array.from(this._itemTypes.values());
    }

    /**
     * Get an item type by type identifier.
     */
    getItemType(type: string): UmbNavItemTypeRegistration | undefined {
        return this._itemTypes.get(type);
    }

    /**
     * Register a custom item slot.
     */
    registerItemSlot(slot: UmbNavItemSlot): void {
        this._itemSlots.set(slot.alias, slot);
        this._notifyChange();
    }

    /**
     * Unregister an item slot.
     */
    unregisterItemSlot(alias: string): boolean {
        const result = this._itemSlots.delete(alias);
        if (result) this._notifyChange();
        return result;
    }

    /**
     * Get all registered item slots.
     */
    getItemSlots(): UmbNavItemSlot[] {
        return Array.from(this._itemSlots.values());
    }

    /**
     * Get item slots by position.
     */
    getItemSlotsByPosition(position: UmbNavItemSlot['position']): UmbNavItemSlot[] {
        return Array.from(this._itemSlots.values()).filter(slot => slot.position === position);
    }

    /**
     * Subscribe to registry changes.
     */
    onChange(callback: () => void): () => void {
        this._changeCallbacks.add(callback);
        return () => {
            this._changeCallbacks.delete(callback);
        };
    }

    /**
     * Clear all registrations.
     */
    clear(): void {
        this._toolbarActions.clear();
        this._modals.clear();
        this._itemTypes.clear();
        this._itemSlots.clear();
        this._notifyChange();
    }

    private _notifyChange(): void {
        this._changeCallbacks.forEach(callback => callback());
    }
}

/**
 * Global extension registry instance.
 */
export const UmbNavExtensionRegistry = new UmbNavExtensionRegistryClass();
