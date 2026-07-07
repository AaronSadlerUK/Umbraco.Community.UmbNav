import type { ModelEntryType, Guid } from './tokens/umbnav.token.ts';

/**
 * Pure tree operations for the UmbNav item hierarchy.
 *
 * These functions are deliberately free of any Umbraco backoffice imports so the
 * drag/drop move logic can be unit-tested in isolation (native HTML5 drag cannot be
 * driven reliably in a browser test).
 */

/**
 * Returns true when `key` sits anywhere inside the subtree of `ancestorKey`.
 * An item is not considered a descendant of itself.
 */
export function isDescendant(
    items: ModelEntryType[],
    ancestorKey: Guid | string | null | undefined,
    key: Guid | string | null | undefined,
): boolean {
    const ancestor = findItem(items, ancestorKey);
    if (!ancestor) return false;
    return containsKey(ancestor.children ?? [], key);
}

/**
 * Returns true when a dragged item may be dropped into the container owned by
 * `targetParentKey`. Dropping an item into itself or into any of its own
 * descendants would detach that subtree from the tree, so those moves are rejected.
 *
 * @param draggedItem The item being dragged, carrying its full subtree.
 * @param targetParentKey Key of the item whose child container is the drop target,
 *   or null/undefined for the root container.
 */
export function canDropInto(
    draggedItem: ModelEntryType,
    targetParentKey: Guid | string | null | undefined,
): boolean {
    if (targetParentKey == null) return true;
    if (targetParentKey === draggedItem.key) return false;
    return !isDescendant([draggedItem], draggedItem.key, targetParentKey);
}

/**
 * Returns a new top-level array in which the item matching `key` has its `children`
 * replaced by `children`. Non-matching items and the passed-in children are kept by
 * reference — the moved subtree must not be cloned, because the sorter tracks its
 * model by object identity and rebuilding it mid-drag corrupts moves of items that
 * carry children.
 */
export function setChildren(
    items: ModelEntryType[],
    key: Guid | string | null | undefined,
    children: ModelEntryType[],
): ModelEntryType[] {
    return items.map((item) => (item.key === key ? { ...item, children } : item));
}

function containsKey(items: ModelEntryType[], key: Guid | string | null | undefined): boolean {
    for (const item of items) {
        if (item.key === key) return true;
        if (item.children && containsKey(item.children, key)) return true;
    }
    return false;
}

function findItem(
    items: ModelEntryType[],
    key: Guid | string | null | undefined,
): ModelEntryType | undefined {
    for (const item of items) {
        if (item.key === key) return item;
        if (item.children) {
            const found = findItem(item.children, key);
            if (found) return found;
        }
    }
    return undefined;
}
