import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
    features: 'src/lib/playwright-features/**/*.feature',
    steps: 'src/lib/playwright-steps/common.steps.js',
});

export default defineConfig({
    testDir,
    reporter: [['json', { outputFile: '.pw-results/output.json' }]],
    use: {
        headless: true,
        screenshot: 'off',
        video: 'off',
    },
    workers: 1,
    timeout: 30000,
    retries: 0,
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
    ],
});
