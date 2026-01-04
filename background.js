import { IP_SOURCES, checkConnectivity } from './ip_sources.js';

chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install' || details.reason === 'update') {
        await selectBestSource();
    }
});

async function selectBestSource() {
    // Check if a source is already set
    const stored = await chrome.storage.sync.get(['ipSource']);
    if (stored.ipSource) {
        // Verify the current source is still good
        const result = await checkConnectivity(stored.ipSource);
        if (result.status === 'online') {
            console.log('Current source is online:', stored.ipSource);
            return;
        }
    }

    console.log('Selecting best IP source...');

    // Try sources in order until one works
    for (const source of IP_SOURCES) {
        console.log(`Checking ${source.name}...`);
        const result = await checkConnectivity(source.url);

        if (result.status === 'online') {
            console.log(`Selected ${source.name} (${source.url})`);
            await chrome.storage.sync.set({ ipSource: source.url });
            break;
        }
    }
    console.log(`It appears that no sources are online. Are you sure you are connected to the internet?`);
}
