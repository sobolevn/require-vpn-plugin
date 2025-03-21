// Logging

// TODO: adjust in development
const verbose = 0

function log(data) {
  if (verbose) {
    console.log(data);
  }
}

// Manage the proxy

async function isUsingVPN(vpnIps, ipCheckerURL) {
  if (!vpnIps || !ipCheckerURL) {
    // If requeired settings are not set, then block by default.
    return false;
  }

  log(`Running an IP request to ${ipCheckerURL}`)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s
  const response = await fetch(ipCheckerURL, {
    'signal': controller.signal,
    'headers': {},
  });
  clearTimeout(timeoutId);

  if (response.status === 200) {
    const responseText = (await response.text()).trim();
    log(`Done, response: ${responseText} ${vpnIps}`);
    return ipsMatch(responseText, vpnIps);
  }
  return false;
}

function ipsMatch(responseText, vpnIps) {
  for (let vpnIp of vpnIps) {
    if (vpnIp === responseText) {
      return true;
    }
    if (vpnIp.includes('*')) {
      return responseText.startsWith(vpnIp.replace('*', ''));
    }
  }
  return false;
}

async function handleProxyRequest(requestInfo) {
  const {
    BLOCKED_HOSTS,
    VPN_IP,
    IP_CHECKER_URL,
    PROXY_URI,
  } = await browser.storage.sync.get([
    'BLOCKED_HOSTS',
    'VPN_IP',
    'IP_CHECKER_URL',
    'PROXY_URI',
  ]);

  const url = new URL(requestInfo.url);
  if (BLOCKED_HOSTS && BLOCKED_HOSTS.indexOf(url.hostname) != -1) {
    const vpn = await (isUsingVPN(VPN_IP, IP_CHECKER_URL).catch(_ => false));
    if (!vpn) {
      const proxyUrl = new URL(PROXY_URI);
      log(`Proxying: ${url.hostname} to ${proxyUrl}, vpn not found`);
      const proxySpec = {
        type: proxyUrl.protocol.replace(':', ''),
        host: proxyUrl.hostname,
        port: proxyUrl.port,
      };
      log(`Proxy spec: ${proxySpec}`);
      return proxySpec;
    }
  }
  return {type: 'direct'};
}

// Listen for a request to open a webpage
browser.proxy.onRequest.addListener(handleProxyRequest, {urls: ['<all_urls>']});

// Log any errors from the proxy script
browser.proxy.onError.addListener(error => {
  console.error(`Proxy error: ${error.message}`);
});
