import { fetchIP, IP_SOURCES } from './ip_sources.js';
import { formatTime } from './time_utils.js';

async function testIPFetching() {
    console.log('Testing IP Fetching...');
    try {
        // Test with the first source (Akamai)
        const ip = await fetchIP(IP_SOURCES[0].url);
        console.log(`[PASS] Fetched IP from ${IP_SOURCES[0].name}: ${ip}`);

        // Test with a JSON source (ipify)
        const jsonSource = IP_SOURCES.find(s => s.type === 'json');
        if (jsonSource) {
            const ipJson = await fetchIP(jsonSource.url);
            console.log(`[PASS] Fetched IP from ${jsonSource.name}: ${ipJson}`);
        }
    } catch (error) {
        console.error('[FAIL] IP Fetching failed:', error);
    }
}

function testTimeFormatting() {
    console.log('\nTesting Time Formatting...');
    const date = new Date('2023-12-25T15:30:45');

    // Test 1: Default (12h, seconds, date)
    const result1 = formatTime(date, { use24Hour: false, showSeconds: true, showDate: true });
    console.log(`Test 1 (Default): ${result1.time} | ${result1.date}`);
    if (result1.time.includes('PM') && result1.time.includes('45')) console.log('[PASS] Test 1');
    else console.error('[FAIL] Test 1');

    // Test 2: 24h, no seconds, no date
    const result2 = formatTime(date, { use24Hour: true, showSeconds: false, showDate: false });
    console.log(`Test 2 (24h, no sec, no date): ${result2.time} | ${result2.date}`);
    if (result2.time.startsWith('15:30') && result2.date === '') console.log('[PASS] Test 2');
    else console.error('[FAIL] Test 2');
}

async function runTests() {
    await testIPFetching();
    testTimeFormatting();
}

runTests();
