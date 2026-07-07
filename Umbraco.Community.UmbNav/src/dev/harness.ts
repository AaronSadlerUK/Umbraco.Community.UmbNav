// Standalone dev harness for drag/drop testing WITHOUT the full Umbraco backoffice.
// Registers UUI elements, mounts a root <umbnav-group> with fixture data, and exposes
// the live value on window so a Playwright spec can dispatch synthetic DragEvents and
// assert the resulting tree. This lets the native-HTML5-drag behaviour be tested in CI.
import '@umbraco-cms/backoffice/external/uui';
import '../components/umbnav-group/umbnav-group.element.ts';
import type { UmbNavGroup } from '../components/umbnav-group/umbnav-group.element.ts';
import type { ModelEntryType, Guid } from '../tokens/umbnav.token.ts';

function item(key: string, name: string, children: ModelEntryType[] = []): ModelEntryType {
    return {
        key: key as Guid,
        name,
        icon: 'icon-link',
        itemType: 'External',
        url: `https://example.com/${key}`,
        udi: null,
        anchor: null,
        published: null,
        contentKey: null,
        children,
    };
}

// A parent that carries a child subtree, and a childless "Link" target — the exact
// shape that failed in the backoffice (drop an item-with-children into a childless item).
const fixture: ModelEntryType[] = [
    item('parent', 'Parent (has children)', [item('child', 'Child')]),
    item('target', 'Target (childless link)'),
];

const group = document.createElement('umbnav-group') as UmbNavGroup;
group.depth = 0;
group.config = [];
group.value = fixture;
group.id = 'root-group';
group.addEventListener('change', () => {
    (window as unknown as { __umbnavValue: ModelEntryType[] }).__umbnavValue = group.value;
});

document.getElementById('app')!.appendChild(group);

// Expose for the test harness.
(window as unknown as { __umbnavGroup: UmbNavGroup }).__umbnavGroup = group;
(window as unknown as { __umbnavValue: ModelEntryType[] }).__umbnavValue = group.value;
