var { contextBridge: e, ipcRenderer: t } = ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, { get: (e, t) => (typeof require < "u" ? require : e)[t] }) : e)(function(e) {
	if (typeof require < "u") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + e + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
})("electron");
e.exposeInMainWorld("electronAPI", {
	minimizeWindow: () => t.send("window-minimize"),
	maximizeWindow: () => t.send("window-maximize"),
	closeWindow: () => t.send("window-close"),
	isMaximized: () => t.invoke("window-is-maximized"),
	onWindowMaximized: (e) => t.on("window-maximized", e),
	onWindowUnmaximized: (e) => t.on("window-unmaximized", e),
	scanPorts: (e, n) => t.invoke("scan-ports", {
		host: e,
		ports: n
	}),
	onScanProgress: (e) => t.on("scan-progress", (t, n) => e(n)),
	dnsQuery: (e, n) => t.invoke("dns-query", {
		domain: e,
		type: n
	}),
	ping: (e, n, r) => t.invoke("ping", {
		host: e,
		count: n,
		timeout: r
	}),
	whois: (e) => t.invoke("whois", { domain: e }),
	httpCheck: (e, n) => t.invoke("http-check", {
		url: e,
		method: n
	}),
	computeHash: (e, n) => t.invoke("compute-hash", {
		text: e,
		algorithm: n
	})
});
