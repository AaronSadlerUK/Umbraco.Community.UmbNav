import { test, expect } from '@playwright/test';

// Drives the REAL UmbSorterController against a standalone <umbnav-group> (src/dev/harness.ts)
// with no Umbraco backoffice. Native HTML5 drag can't be driven by Playwright's mouse API, so
// we dispatch the DragEvents ourselves with a shared DataTransfer.

test.beforeEach(async ({ page }) => {
    await page.goto('/App_Plugins/UmbNav/', { waitUntil: 'networkidle' });
    await expect(page.locator('umbnav-item')).toHaveCount(3);
});

test('items can be reordered at the top level by dragging', async ({ page }) => {
    const order = await page.evaluate(async () => {
        const raf = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const tick = () => new Promise((r) => setTimeout(r, 30));
        const root = document.querySelector('umbnav-group#root-group') as any;
        const container = root.shadowRoot.querySelector('.umbnav-container');
        const sourceItem = root.shadowRoot.querySelector('umbnav-item[key="target"]') as HTMLElement; // 2nd item
        const anchorItem = root.shadowRoot.querySelector('umbnav-item[key="parent"]') as HTMLElement; // 1st item

        const dt = new DataTransfer();
        const fire = (el: EventTarget, type: string, x: number, y: number, isDrag: boolean, bubbles = true) => {
            const ev: any = isDrag
                ? new DragEvent(type, { bubbles, cancelable: true, composed: true, clientX: x, clientY: y })
                : new MouseEvent(type, { bubbles, cancelable: true, composed: true, clientX: x, clientY: y, button: 0 });
            if (isDrag) Object.defineProperty(ev, 'dataTransfer', { value: dt });
            el.dispatchEvent(ev);
        };
        const c = (el: Element) => { const r = el.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2] as const; };

        // Drag the 2nd item ("target") up over the top half of the 1st item ("parent").
        const [sx, sy] = c(sourceItem);
        fire(sourceItem, 'mousedown', sx, sy, false);
        fire(sourceItem, 'dragstart', sx, sy, true);
        await raf(); await tick();

        const aRect = anchorItem.getBoundingClientRect();
        const ax = aRect.x + aRect.width / 2;
        for (let i = 0; i < 8; i++) {
            fire(container, 'dragover', ax, aRect.top + 2 + (i % 2), true, false);
            await raf(); await tick();
        }
        fire(container, 'drop', ax, aRect.top + 2, true, false);
        fire(sourceItem, 'dragend', sx, sy, true);
        await raf(); await tick();

        return ((window as any).__umbnavValue ?? []).map((i: any) => i.name);
    });

    // "target" moved above "parent".
    expect(order).toEqual(['Target (childless link)', 'Parent (has children)']);
});
