// Logging

// TODO: adjust in development
const verbose = 1

function log(data) {
  if (verbose) {
    console.log(data)
  }
}

// Manage the proxy

async function isUsingVPN(VPN_IP, IP_CHECKER_URL) {
  if (!VPN_IP || !IP_CHECKER_URL) {
    // If requeired settings are not set, then block by default.
    return false;
  }

  log(`Running an IP request to ${IP_CHECKER_URL}`)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s
  const response = await fetch(IP_CHECKER_URL, {
    'signal': controller.signal,
    'headers': {},
  });
  clearTimeout(timeoutId);

  if (response.status === 200) {
    const responseText = await response.text();
    log(`Done, response: ${responseText} ${responseText.trim() === VPN_IP}`);
    return responseText.trim() === VPN_IP;
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
  console.log(
    BLOCKED_HOSTS,
    VPN_IP,
    IP_CHECKER_URL,
    PROXY_URI,
  );

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
      log(proxySpec);
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
