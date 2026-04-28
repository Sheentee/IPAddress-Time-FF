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
    sourceListEl.textContent = '';

    IP_SOURCES.forEach(source => {
        const item = document.createElement('div');
        item.className = 'source-item';

        // Label Container
        const label = document.createElement('label');
        label.className = 'radio-label';
        label.style.flex = '1';

        // Radio Input
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'ipSource';
        input.value = source.url;
        if (source.url === window.currentIpSource) {
            input.checked = true;
        }
        input.addEventListener('change', saveSettings);

        // Name Text
        const nameSpan = document.createElement('span');
        nameSpan.textContent = source.name;

        // Hostname Label
        const hostnameSpan = document.createElement('span');
        hostnameSpan.className = 'label';
        hostnameSpan.style.marginLeft = '8px';
        hostnameSpan.style.fontSize = '10px';
        try {
            hostnameSpan.textContent = new URL(source.url).hostname;
        } catch (e) {
            hostnameSpan.textContent = source.url;
        }

        // Assemble Label
        label.appendChild(input);
        label.appendChild(nameSpan);
        label.appendChild(hostnameSpan);

        // Status Indicator
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-indicator';
        statusDiv.id = `status-${btoa(source.url)}`;

        const dot = document.createElement('span');
        dot.className = 'dot pending';

        const statusText = document.createElement('span');
        statusText.textContent = 'Checking...';

        statusDiv.appendChild(dot);
        statusDiv.appendChild(statusText);

        // Assemble Item
        item.appendChild(label);
        item.appendChild(statusDiv);

        sourceListEl.appendChild(item);
    });
}

async function runConnectivityChecks() {
    for (const source of IP_SOURCES) {
        checkConnectivity(source.url).then(result => {
            const statusEl = document.getElementById(`status-${btoa(source.url)}`);
            if (statusEl) {
                // Clear existing content safely or update strict children if structure is guaranteed
                // Safer to clear and rebuild these two small spans
                while (statusEl.firstChild) {
                    statusEl.removeChild(statusEl.firstChild);
                }

                const statusClass = result.status === 'online' ? 'online' : 'offline';
                const statusTextContent = result.status === 'online' ? `${result.latency}ms` : 'Offline';

                const dot = document.createElement('span');
                dot.className = `dot ${statusClass}`;

                const text = document.createElement('span');
                text.textContent = statusTextContent;

                statusEl.appendChild(dot);
                statusEl.appendChild(text);
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
