import { fetchIP, IP_SOURCES } from './ip_sources.js';
import { formatTime } from './time_utils.js';

// Default settings
const DEFAULT_SETTINGS = {
    use24Hour: false,
    showSeconds: true,
    showDate: true,
    ipSource: IP_SOURCES[0].url
};

// Elements
const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const ipEl = document.getElementById('ip-address');
const btnCopy = document.getElementById('btn-copy');
const btnOptions = document.getElementById('btn-options');
const btnPopout = document.getElementById('btn-popout');

let currentSettings = { ...DEFAULT_SETTINGS };

// Initialize
async function init() {
    await loadSettings();
    startClock();
    fetchAndDisplayIP();

    btnCopy.addEventListener('click', copyIP);
    btnOptions.addEventListener('click', openOptions);
    if (btnPopout) {
        btnPopout.addEventListener('click', popOut);
    }
}

async function loadSettings() {
    try {
        const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
        currentSettings = { ...DEFAULT_SETTINGS, ...stored };
    } catch (e) {
        console.error('Failed to load settings:', e);
    }
}

function startClock() {
    updateTime();
    setInterval(updateTime, 1000);
}

function updateTime() {
    const now = new Date();
    const { time, date } = formatTime(now, currentSettings);
    timeEl.textContent = time;
    dateEl.textContent = date;
}

async function fetchAndDisplayIP() {
    try {
        const ip = await fetchIP(currentSettings.ipSource);
        ipEl.textContent = ip;
    } catch (error) {
        ipEl.textContent = 'Error fetching IP';
        ipEl.style.color = 'var(--error-color)';
    }
}

async function copyIP() {
    const ip = ipEl.textContent;
    if (ip && ip !== 'Fetching...' && ip !== 'Error fetching IP') {
        try {
            await navigator.clipboard.writeText(ip);

            // Visual feedback
            // Visual feedback
            const iconCopy = document.getElementById('icon-copy');
            const iconCheck = document.getElementById('icon-check');

            iconCopy.classList.add('hidden');
            iconCheck.classList.remove('hidden');
            btnCopy.style.color = 'var(--success-color)';

            setTimeout(() => {
                iconCopy.classList.remove('hidden');
                iconCheck.classList.add('hidden');
                btnCopy.style.color = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
}

function openOptions() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

function popOut() {
    chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 350,
        height: 600
    });
    window.close(); // Close the popup after opening the new window
}

init();
