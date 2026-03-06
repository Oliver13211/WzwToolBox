import { BrowserWindow, app, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
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
app.whenReady().then(() => {
	createWindow();
	app.on("activate", function() {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});
app.on("window-all-closed", function() {
	if (process.platform !== "darwin") app.quit();
});
