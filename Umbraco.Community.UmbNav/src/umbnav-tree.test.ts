import { describe, it, expect } from 'vitest';
import { isDescendant, canDropInto } from './umbnav-tree.ts';
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
