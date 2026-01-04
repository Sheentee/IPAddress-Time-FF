export const IP_SOURCES = [
  { name: 'Akamai', url: 'https://whatismyip.akamai.com/', type: 'text' },
  { name: 'Amazon AWS', url: 'https://checkip.amazonaws.com/', type: 'text' },
  { name: 'ipify', url: 'https://api.ipify.org?format=json', type: 'json', field: 'ip' },
  { name: 'ipinfo.io', url: 'https://ipinfo.io/ip', type: 'text' },
  { name: 'ifconfig.co', url: 'https://ifconfig.co/ip', type: 'text' },
  { name: 'wtfismyip', url: 'https://wtfismyip.com/text', type: 'text' },
  { name: 'icanhazip', url: 'https://icanhazip.com/', type: 'text' },
  { name: 'ifconfig.io', url: 'https://ifconfig.io/ip', type: 'text' },
  { name: 'ipecho.net', url: 'https://ipecho.net/plain', type: 'text' }
];

export async function fetchIP(sourceUrl) {
  const source = IP_SOURCES.find(s => s.url === sourceUrl) || IP_SOURCES[0];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(source.url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    let ip = '';
    if (source.type === 'json') {
      const data = await response.json();
      ip = data[source.field || 'ip'];
    } else {
      ip = await response.text();
    }
    
    return ip.trim();
  } catch (error) {
    console.error('Error fetching IP:', error);
    throw error;
  }
}

export async function checkConnectivity(sourceUrl) {
  const start = performance.now();
  try {
    await fetchIP(sourceUrl);
    const end = performance.now();
    return { status: 'online', latency: Math.round(end - start) };
  } catch (error) {
    return { status: 'offline', latency: null };
  }
}
