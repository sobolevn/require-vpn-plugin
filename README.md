# require-vpn

FireFox plugin to require an existing VPN connection before accessing specified hosts.

## Example

Let's say you have a website with a sensitive data (your bank account, work project, password store, etc) that you don't want to accidentally access with an untrusted network.

This used to happen quite often with my frequent bussiness trips:
- I have some existing open tabs with my private data
- Then I connect to a public wifi on a train or in a bar
- My data could have been leaked
- Then I remember that I have to activate my VPN :)

To fight this problem you can use `require-vpn` plugin.
Here's how it works:
- It creates a request about your current IP to some `IP_CHECKER_URL`
- If your IP matches your `VPN_IP`, you are good to go and visit `BLOCKED_HOSTS`
- If not, you would be redirected to `PROXY_URI` (or if it is not available, the request won't make it to the original server and will be just blocked)

## Configuration

- `VPN_IP` - your VPN IP, which is expected
- `BLOCKED_HOSTS` - a new-line separated list with hostnames of blocked resources, default: `['example.com']`
- `IP_CHECKER_URL` - a URL to any service that will receive a `GET` request and return your API in plain text, default: `http://icanhazip.com`
- `PROXY_URI` - a URI for your proxy server to where a redirect will be made, see [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/proxy/ProxyInfo) what formats are supported, default: `http://localhost:63555`

## Contributing

At the moment PRs are not expected. It works for me.
If you use Chrome, Opera, etc - then you can test this plugin and report if it is supported.
