const blockedHostsTextArea = document.querySelector('#blocked-hosts');
const vpnIpInput = document.querySelector('#vpn-ip');
const ipCheckerUrlInput = document.querySelector('#ip-checker-url');
const proxyUriInput = document.querySelector('#proxy-uri');

const defaults = {
  'BLOCKED_HOSTS': ['example.com'],
  'VPN_IP': '',
  'IP_CHECKER_URL': 'http://icanhazip.com',
  'PROXY_URI': 'http://localhost:63555',
}

// Store the currently selected settings using browser.storage.sync.
async function storeSettings() {
  let blockedHosts = blockedHostsTextArea.value.split('\n').map(i => i.trim());
  let vpnIp = vpnIpInput.value.split('\n').map(i => i.trim());
  let ipCheckerUrl = ipCheckerUrlInput.value.trim();
  let proxyUri = proxyUriInput.value.trim();

  await browser.storage.sync.set({
    'BLOCKED_HOSTS': blockedHosts,
    'VPN_IP': vpnIp,
    'IP_CHECKER_URL': ipCheckerUrl,
    'PROXY_URI': proxyUri,
  });
}

// Load saved settings
async function restoreOptions() {
  const settings = await browser.storage
    .sync.get([
      'BLOCKED_HOSTS',
      'VPN_IP',
      'IP_CHECKER_URL',
      'PROXY_URI',
    ]);

  Object.assign(defaults, settings);
  await browser.storage.sync.set(defaults);

  blockedHostsTextArea.value = defaults.BLOCKED_HOSTS.join('\n');
  vpnIpInput.value = defaults.VPN_IP.join('\n');
  ipCheckerUrlInput.value = defaults.IP_CHECKER_URL;
  proxyUriInput.value = defaults.PROXY_URI;
}

// Whenever the contents of the textarea changes, save the new values
const nodes = document.querySelectorAll('.require-vpn-option-input');
for (let node of nodes) {
  node.addEventListener('change', storeSettings);
}

// On opening the options page, fetch stored settings and update the UI with them.
document.addEventListener('DOMContentLoaded', restoreOptions);
