import { BrowserWindow, app, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import net from "net";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		frame: false,
		icon: path.join(__dirname, "../public/icon.png"),
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: false,
			contextIsolation: true
		}
	});
	if (process.env.VITE_DEV_SERVER_URL) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	else mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
	mainWindow.setMenu(null);
	mainWindow.on("maximize", () => {
		mainWindow.webContents.send("window-maximized");
	});
	mainWindow.on("unmaximize", () => {
		mainWindow.webContents.send("window-unmaximized");
	});
}
ipcMain.on("window-minimize", (event) => {
	const win = BrowserWindow.fromWebContents(event.sender);
	if (win) win.minimize();
});
ipcMain.on("window-maximize", (event) => {
	const win = BrowserWindow.fromWebContents(event.sender);
	if (win) if (win.isMaximized()) win.unmaximize();
	else win.maximize();
});
ipcMain.on("window-close", (event) => {
	const win = BrowserWindow.fromWebContents(event.sender);
	if (win) win.close();
});
ipcMain.handle("window-is-maximized", (event) => {
	const win = BrowserWindow.fromWebContents(event.sender);
	return win ? win.isMaximized() : false;
});
function scanPort(host, port, timeout = 3e3) {
	return new Promise((resolve) => {
		const socket = new net.Socket();
		let isOpen = false;
		socket.setTimeout(timeout);
		socket.on("connect", () => {
			isOpen = true;
			socket.destroy();
		});
		socket.on("timeout", () => {
			socket.destroy();
		});
		socket.on("error", () => {
			socket.destroy();
		});
		socket.on("close", () => {
			resolve(isOpen);
		});
		socket.connect(port, host);
	});
}
ipcMain.handle("scan-ports", async (event, { host, ports }) => {
	const results = [];
	const totalPorts = ports.length;
	for (let i = 0; i < ports.length; i++) {
		const port = ports[i];
		const startTime = Date.now();
		const isOpen = await scanPort(host, port.port);
		const responseTime = Date.now() - startTime;
		results.push({
			...port,
			status: isOpen ? "open" : "closed",
			responseTime: isOpen ? responseTime : "-"
		});
		event.sender.send("scan-progress", {
			current: i + 1,
			total: totalPorts,
			percent: Math.round((i + 1) / totalPorts * 100)
		});
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	return results;
});
app.whenReady().then(() => {
	createWindow();
	app.on("activate", function() {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});
app.on("window-all-closed", function() {
	if (process.platform !== "darwin") app.quit();
});
