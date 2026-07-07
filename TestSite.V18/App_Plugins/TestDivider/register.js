// Test extension: Register a "Divider" custom item type with UmbNav
// This verifies that custom itemTypes are preserved (not falling back to "Title")

const POLL_INTERVAL = 500;
const MAX_ATTEMPTS = 20;

async function registerDivider() {
    let attempts = 0;

    const interval = setInterval(async () => {
        attempts++;

        try {
            const { UmbNavExtensionRegistry } = await import('@umbraco-community/umbnav/api');

            UmbNavExtensionRegistry.registerItemType({
                type: 'divider',
                label: 'Add Divider',
                icon: 'icon-navigation-horizontal',
                allowChildren: false,
                defaultValues: {
                    name: '---',
                    icon: 'icon-navigation-horizontal',
                    itemType: 'divider'
                }
            });

            console.log('[TestDivider] Registered "divider" custom item type');
            clearInterval(interval);
        } catch (e) {
            if (attempts >= MAX_ATTEMPTS) {
                console.warn('[TestDivider] Could not register divider type - UmbNav API not available');
                clearInterval(interval);
            }
        }
    }, POLL_INTERVAL);
}

registerDivider();

export default {};
