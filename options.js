import { IP_SOURCES, checkConnectivity } from './ip_sources.js';

// Default settings (must match popup.js)
const DEFAULT_SETTINGS = {
    use24Hour: false,
    showSeconds: true,
    showDate: true,
    ipSource: IP_SOURCES[0].url
};

// Elements
const use24HourEl = document.getElementById('use24Hour');
const showSecondsEl = document.getElementById('showSeconds');
const showDateEl = document.getElementById('showDate');
const sourceListEl = document.getElementById('source-list');
const statusMessageEl = document.getElementById('status-message');

// Initialize
async function init() {
    await loadSettings();
    renderSourceList();
    runConnectivityChecks();

    // Event listeners
    use24HourEl.addEventListener('change', saveSettings);
    showSecondsEl.addEventListener('change', saveSettings);
    showDateEl.addEventListener('change', saveSettings);
}

async function loadSettings() {
    const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);

    use24HourEl.checked = stored.use24Hour;
    showSecondsEl.checked = stored.showSeconds;
    showDateEl.checked = stored.showDate;

    // Store current source to select it in the list
    window.currentIpSource = stored.ipSource;
}

async function saveSettings() {
    const settings = {
        use24Hour: use24HourEl.checked,
        showSeconds: showSecondsEl.checked,
        showDate: showDateEl.checked,
        ipSource: document.querySelector('input[name="ipSource"]:checked').value
    };

    await chrome.storage.sync.set(settings);
    showStatus('Settings saved');
}

function renderSourceList() {
    sourceListEl.innerHTML = '';

    IP_SOURCES.forEach(source => {
        const item = document.createElement('div');
        item.className = 'source-item';

        const isChecked = source.url === window.currentIpSource ? 'checked' : '';

        item.innerHTML = `
      <label class="radio-label" style="flex: 1">
        <input type="radio" name="ipSource" value="${source.url}" ${isChecked}>
        <span>${source.name}</span>
        <span class="label" style="margin-left: 8px; font-size: 10px;">${new URL(source.url).hostname}</span>
      </label>
      <div class="status-indicator" id="status-${btoa(source.url)}">
        <span class="dot pending"></span>
        <span>Checking...</span>
      </div>
    `;

        // Add change listener to the radio button
        const radio = item.querySelector('input[type="radio"]');
        radio.addEventListener('change', saveSettings);

        sourceListEl.appendChild(item);
    });
}

async function runConnectivityChecks() {
    for (const source of IP_SOURCES) {
        checkConnectivity(source.url).then(result => {
            const statusEl = document.getElementById(`status-${btoa(source.url)}`);
            if (statusEl) {
                const statusClass = result.status === 'online' ? 'online' : 'offline';
                const statusText = result.status === 'online' ? `${result.latency}ms` : 'Offline';

                statusEl.innerHTML = `
          <span class="dot ${statusClass}"></span>
          <span>${statusText}</span>
        `;
            }
        });
    }
}

function showStatus(msg) {
    statusMessageEl.textContent = msg;
    setTimeout(() => {
        statusMessageEl.textContent = '';
    }, 2000);
}

init();
