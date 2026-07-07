import { describe, it, expect } from 'vitest';
import { isDescendant, canDropInto, setChildren } from './umbnav-tree.ts';
import type { ModelEntryType, Guid } from './tokens/umbnav.token.ts';

// Minimal item builder — only the fields the tree functions care about.
function item(key: string, children: ModelEntryType[] = []): ModelEntryType {
    return {
        key: key as Guid,
        name: key,
        icon: null,
        itemType: 'External',
        udi: null,
        anchor: null,
        published: null,
        contentKey: null,
        children,
    };
}

// a
// ├─ b
// │  └─ c
// └─ d
const tree: ModelEntryType[] = [
    item('a', [item('b', [item('c')]), item('d')]),
    item('e'),
];

describe('isDescendant', () => {
    it('returns true for a direct child', () => {
        expect(isDescendant(tree, 'a', 'b')).toBe(true);
    });

    it('returns true for a deeply nested descendant', () => {
        expect(isDescendant(tree, 'a', 'c')).toBe(true);
    });

    it('returns false for a sibling', () => {
        expect(isDescendant(tree, 'a', 'e')).toBe(false);
    });

    it('returns false for an item against itself', () => {
        expect(isDescendant(tree, 'a', 'a')).toBe(false);
    });

    it('returns false when the ancestor key does not exist', () => {
        expect(isDescendant(tree, 'zzz', 'c')).toBe(false);
    });
});

describe('canDropInto', () => {
    // dragged subtree:  a → (b → c), d
    const dragged = item('a', [item('b', [item('c')]), item('d')]);

    it('allows dropping at the root (no parent)', () => {
        expect(canDropInto(dragged, null)).toBe(true);
    });

    it('allows dropping into an unrelated item', () => {
        expect(canDropInto(dragged, 'e')).toBe(true);
    });

    it('rejects dropping an item into its own direct child container', () => {
        expect(canDropInto(dragged, 'a')).toBe(false);
    });

    it('rejects dropping an item into a deeper descendant', () => {
        expect(canDropInto(dragged, 'b')).toBe(false);
        expect(canDropInto(dragged, 'c')).toBe(false);
    });
});

describe('setChildren', () => {
    it('replaces the children of the matching item', () => {
        const items = [item('a'), item('b')];
        const newChildren = [item('x')];
        const result = setChildren(items, 'a', newChildren);
        expect(result.find((i) => i.key === ('a' as Guid))!.children).toBe(newChildren);
    });

    it('preserves the identity of the moved child objects (no rebuild)', () => {
        const movedChild = item('x', [item('y')]);
        const result = setChildren([item('a')], 'a', [movedChild]);
        // The sorter tracks its model by object identity — the moved subtree must
        // pass through untouched, not be cloned.
        expect(result.find((i) => i.key === ('a' as Guid))!.children[0]).toBe(movedChild);
        expect(result.find((i) => i.key === ('a' as Guid))!.children[0].children[0]).toBe(movedChild.children[0]);
    });

    it('leaves non-matching items untouched by reference', () => {
        const a = item('a');
        const b = item('b');
        const result = setChildren([a, b], 'a', [item('x')]);
        expect(result.find((i) => i.key === ('b' as Guid))).toBe(b);
    });

    it('returns a new top-level array', () => {
        const items = [item('a')];
        const result = setChildren(items, 'a', [item('x')]);
        expect(result).not.toBe(items);
    });

    it('returns items unchanged when the key is not found', () => {
        const a = item('a');
        const result = setChildren([a], 'zzz', [item('x')]);
        expect(result[0]).toBe(a);
    });
});
