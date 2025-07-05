export function dispatchToggleNode(element: HTMLElement, key: string) {
    try {
        const event = new CustomEvent<{ key: string }>('toggle-children-event', { detail: { key } });
        element.dispatchEvent(event);
    } catch (error) {
        console.error('Error dispatching toggle-children-event:', error);
    }
}

export function dispatchAddImage(element: HTMLElement, key: string | null | undefined) {
    try {
        const event = new CustomEvent<{ key: string | null | undefined }>('add-image-event', { detail: { key } });
        element.dispatchEvent(event);
    } catch (error) {
        console.error('Error dispatching add-image-event:', error);
    }
}

export function dispatchToggleItemSettings(element: HTMLElement, key: string | null | undefined) {
    try {
        const event = new CustomEvent<{ key: string | null | undefined }>('toggle-itemsettings-event', { detail: { key } });
        element.dispatchEvent(event);
    } catch (error) {
        console.error('Error dispatching toggle-itemsettings-event:', error);
    }
}

export function dispatchToggleVisibility(element: HTMLElement, key: string | null | undefined) {
    try {
        const event = new CustomEvent<{ key: string | null | undefined }>('add-togglevisibility-event', { detail: { key } });
        element.dispatchEvent(event);
    } catch (error) {
        console.error('Error dispatching add-togglevisibility-event:', error);
    }
}

export function dispatchEditNode(element: HTMLElement, key: string | null | undefined) {
    try {
        const event = new CustomEvent<{ key: string | null | undefined }>('edit-node-event', { detail: { key } });
        element.dispatchEvent(event);
    } catch (error) {
        console.error('Error dispatching edit-node-event:', error);
    }
}

export function dispatchRemoveNode(element: HTMLElement, key: string) {
    try {
        const event = new CustomEvent<{ key: string }>('remove-node-event', { detail: { key } });
        element.dispatchEvent(event);
    } catch (error) {
        console.error('Error dispatching remove-node-event:', error);
    }
}