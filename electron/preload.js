const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onWindowMaximized: (callback) => ipcRenderer.on('window-maximized', callback),
  onWindowUnmaximized: (callback) => ipcRenderer.on('window-unmaximized', callback),
  // 端口扫描 API
  scanPorts: (host, ports) => ipcRenderer.invoke('scan-ports', { host, ports }),
  onScanProgress: (callback) => ipcRenderer.on('scan-progress', (event, data) => callback(data)),
  // DNS 查询 API
  dnsQuery: (domain, type) => ipcRenderer.invoke('dns-query', { domain, type }),
  // Ping 测试 API
  ping: (host, count, timeout) => ipcRenderer.invoke('ping', { host, count, timeout })
})
