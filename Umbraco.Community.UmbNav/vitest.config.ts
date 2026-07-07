import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Unit tests live next to the code as *.test.ts. The Playwright E2E suite in
        // tests/ is driven by @playwright/test, so keep it out of Vitest.
        include: ['src/**/*.test.ts'],
        exclude: ['tests/**', 'node_modules/**'],
        environment: 'node',
    },
});
