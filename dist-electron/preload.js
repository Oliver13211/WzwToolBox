var { contextBridge, ipcRenderer } = (/* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof require !== "undefined" ? require : a)[b] }) : x)(function(x) {
	if (typeof require !== "undefined") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
}))("electron");
contextBridge.exposeInMainWorld("electronAPI", {
	minimizeWindow: () => ipcRenderer.send("window-minimize"),
	maximizeWindow: () => ipcRenderer.send("window-maximize"),
	closeWindow: () => ipcRenderer.send("window-close"),
	isMaximized: () => ipcRenderer.invoke("window-is-maximized"),
	onWindowMaximized: (callback) => ipcRenderer.on("window-maximized", callback),
	onWindowUnmaximized: (callback) => ipcRenderer.on("window-unmaximized", callback),
	scanPorts: (host, ports) => ipcRenderer.invoke("scan-ports", {
		host,
		ports
	}),
	onScanProgress: (callback) => ipcRenderer.on("scan-progress", (event, data) => callback(data))
});
