import { defineConfig, devices } from '@playwright/test';

// Config for the standalone drag/drop harness (tests-harness/). Unlike the backoffice E2E
// suite in tests/, this needs no running Umbraco — it boots the Vite dev server, mounts
// <umbnav-group> from src/dev/harness.ts, and drives the real sorter with synthetic drags.
export default defineConfig({
    testDir: './tests-harness',
    fullyParallel: true,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            // Uses the system Chromium/Edge so no browser download is required.
            use: { ...devices['Desktop Chrome'], channel: 'msedge' },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173/App_Plugins/UmbNav/',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
    },
});
