import { TemplateResult, html } from '@umbraco-cms/backoffice/external/lit';
import { ModelEntryType, Guid } from '../tokens/umbnav.token.js';
import { UmbPropertyEditorConfigProperty } from '@umbraco-cms/backoffice/property-editor';

/**
 * Represents a toolbar action that can be added to UmbNav items.
 */
export interface UmbNavToolbarAction {
    /** Unique identifier for this action */
    alias: string;
    /** Display label for the action */
    label: string;
    /** Icon to display (UUI icon name) */
    icon: string;
    /** Position in toolbar: 'start' | 'end' | number for specific position */
    position?: 'start' | 'end' | number;
    /** Whether this action is visible for the given item */
    isVisible?: (item: ModelEntryType, config: UmbPropertyEditorConfigProperty[]) => boolean;
    /** Handler when the action is clicked */
    onExecute: (item: ModelEntryType, context: UmbNavActionContext) => void | Promise<void>;
}

/**
 * Context provided to toolbar action handlers.
 */
export interface UmbNavActionContext {
    /** The host element */
    host: HTMLElement;
    /** Current configuration */
    config: UmbPropertyEditorConfigProperty[];
    /** Update the item */
    updateItem: (item: ModelEntryType) => void;
    /** Remove the item */
    removeItem: (key: Guid) => void;
    /** Open a modal */
    openModal: <T>(token: unknown, data: unknown) => Promise<T | undefined>;
}

/**
 * Represents a custom item type that can be added to UmbNav.
 */
export interface UmbNavItemTypeRegistration {
    /** Unique type identifier (e.g., 'custom', 'button') */
    type: string;
    /** Display label for this type */
    label: string;
    /** Icon for this type */
    icon: string;
    /** Whether this type can have children */
    allowChildren?: boolean;
    /** Custom render function for the item display */
    render?: (item: ModelEntryType) => TemplateResult;
    /** Modal token to open when editing this type */
    editModalToken?: unknown;
    /** Modal token to open when creating this type */
    createModalToken?: unknown;
}

/**
 * Represents an extension point for rendering custom content in UmbNav items.
 */
export interface UmbNavItemSlot {
    /** Unique identifier for this slot */
    alias: string;
    /** Position: 'before-name' | 'after-name' | 'before-toolbar' | 'after-toolbar' */
    position: 'before-name' | 'after-name' | 'before-toolbar' | 'after-toolbar';
    /** Render function */
    render: (item: ModelEntryType, config: UmbPropertyEditorConfigProperty[]) => TemplateResult;
    /** Visibility check */
    isVisible?: (item: ModelEntryType, config: UmbPropertyEditorConfigProperty[]) => boolean;
}

/**
 * Configuration for the UmbNav extension system.
 */
export interface UmbNavExtensionConfig {
    /** Custom toolbar actions */
    toolbarActions?: UmbNavToolbarAction[];
    /** Custom item types */
    itemTypes?: UmbNavItemTypeRegistration[];
    /** Custom item slots */
    itemSlots?: UmbNavItemSlot[];
}

/**
 * Event detail for toolbar action events.
 */
export interface UmbNavToolbarActionEventDetail {
    action: UmbNavToolbarAction;
    item: ModelEntryType;
}

/**
 * Event detail for item update events.
 */
export interface UmbNavItemUpdateEventDetail {
    item: ModelEntryType;
    previousItem?: ModelEntryType;
}

/**
 * Event detail for item add events.
 */
export interface UmbNavItemAddEventDetail {
    item: ModelEntryType;
    parentKey?: Guid | null;
}

/**
 * Event detail for item remove events.
 */
export interface UmbNavItemRemoveEventDetail {
    key: Guid;
    item?: ModelEntryType;
}

/**
 * Base class for creating custom UmbNav extensions.
 * Provides helper methods for common extension patterns.
 */
export class UmbNavExtensionBase {
    /**
     * Creates a simple toolbar action.
     */
    static createToolbarAction(
        alias: string,
        label: string,
        icon: string,
        onExecute: UmbNavToolbarAction['onExecute'],
        options?: Partial<UmbNavToolbarAction>
    ): UmbNavToolbarAction {
        return {
            alias,
            label,
            icon,
            onExecute,
            ...options
        };
    }

    /**
     * Creates an empty template result.
     */
    static empty(): TemplateResult {
        return html``;
    }
}
