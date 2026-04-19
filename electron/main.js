import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { URL } from 'url'
import net from 'net'
import dns from 'dns'
import http from 'http'
import https from 'https'
import crypto from 'crypto'
import { promisify } from 'util'
import { exec } from 'child_process'
import iconv from 'iconv-lite'

const execAsync = promisify(exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
  
  mainWindow.setMenu(null)

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized')
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized')
  })
}

ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) win.minimize()
})

ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }
})

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) win.close()
})

ipcMain.handle('window-is-maximized', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  return win ? win.isMaximized() : false
})

// 端口扫描功能
function scanPort(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let isOpen = false

    socket.setTimeout(timeout)

    socket.on('connect', () => {
      isOpen = true
      socket.destroy()
    })

    socket.on('timeout', () => {
      socket.destroy()
    })

    socket.on('error', () => {
      socket.destroy()
    })

    socket.on('close', () => {
      resolve(isOpen)
    })

    socket.connect(port, host)
  })
}

ipcMain.handle('scan-ports', async (event, { host, ports }) => {
  const results = []
  const totalPorts = ports.length

  for (let i = 0; i < ports.length; i++) {
    const port = ports[i]
    const startTime = Date.now()
    const isOpen = await scanPort(host, port.port)
    const responseTime = Date.now() - startTime

    results.push({
      ...port,
      status: isOpen ? 'open' : 'closed',
      responseTime: isOpen ? responseTime : '-'
    })

    // 发送进度更新
    event.sender.send('scan-progress', {
      current: i + 1,
      total: totalPorts,
      percent: Math.round(((i + 1) / totalPorts) * 100)
    })

    // 添加小延迟避免过快扫描
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  return results
})

// DNS 查询功能 - 使用系统 DNS
ipcMain.handle('dns-query', async (event, { domain, type }) => {
  const startTime = Date.now()
  
  try {
    let answers = []
    
    // 使用 dns.lookup 进行基础查询 (A 记录和 AAAA 记录)
    if (type === 'A') {
      const { address } = await dns.promises.lookup(domain, { family: 4 })
      answers = [{ type: 'A', data: address, ttl: 300 }]
    } else if (type === 'AAAA') {
      const { address } = await dns.promises.lookup(domain, { family: 6 })
      answers = [{ type: 'AAAA', data: address, ttl: 300 }]
    } else {
      // 对于其他记录类型，使用 resolve 方法
      let records = []
      switch (type) {
        case 'MX':
          records = await dns.promises.resolveMx(domain)
          answers = records.map(mx => ({ 
            type: 'MX', 
            data: `${mx.priority} ${mx.exchange}`, 
            ttl: 300 
          }))
          break
        case 'NS':
          records = await dns.promises.resolveNs(domain)
          answers = records.map(ns => ({ type: 'NS', data: ns, ttl: 300 }))
          break
        case 'CNAME':
          records = await dns.promises.resolveCname(domain)
          answers = records.map(cname => ({ type: 'CNAME', data: cname, ttl: 300 }))
          break
        case 'TXT':
          records = await dns.promises.resolveTxt(domain)
          answers = records.map(txt => ({ type: 'TXT', data: txt.join(' '), ttl: 300 }))
          break
        case 'SOA':
          const soa = await dns.promises.resolveSoa(domain)
          answers = [{
            type: 'SOA',
            data: `${soa.nsname} ${soa.hostmaster} ${soa.serial}`,
            ttl: soa.refresh
          }]
          break
        default:
          // 尝试通用 resolve
          try {
            records = await dns.promises.resolve(domain, type)
            answers = records.map(r => ({ type, data: String(r), ttl: 300 }))
          } catch (e) {
            // 如果 resolve 失败，尝试 lookup 作为后备
            if (type === 'ANY' || type === 'A') {
              const { address } = await dns.promises.lookup(domain)
              answers = [{ type: 'A', data: address, ttl: 300 }]
            } else {
              throw e
            }
          }
      }
    }

    const queryTime = Date.now() - startTime

    return {
      success: true,
      domain,
      type,
      answers,
      queryTime
    }
  } catch (error) {
    const queryTime = Date.now() - startTime
    
    // 特殊错误处理
    let errorMessage = error.message
    if (error.code === 'ENOTFOUND') {
      errorMessage = '域名不存在或无法解析'
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'DNS 服务器连接被拒绝'
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ETIMEOUT') {
      errorMessage = 'DNS 查询超时'
    } else if (error.code === 'EAI_AGAIN') {
      errorMessage = 'DNS 服务暂时不可用，请稍后重试'
    }

    return {
      success: false,
      domain,
      type,
      error: errorMessage,
      queryTime
    }
  }
})

// Ping 测试功能
ipcMain.handle('ping', async (event, { host, count, timeout }) => {
  const isWindows = process.platform === 'win32'
  const pingCount = Math.min(Math.max(count || 4, 1), 10)
  const pingTimeout = Math.min(Math.max(timeout || 8000, 1000), 30000)

  try {
    let command
    if (isWindows) {
      command = `ping -n ${pingCount} -w ${pingTimeout} ${host}`
    } else {
      command = `ping -c ${pingCount} -W ${Math.ceil(pingTimeout / 1000)} ${host}`
    }

    const { stdout, stderr } = await execAsync(command, {
      timeout: pingTimeout * pingCount + 10000,
      maxBuffer: 1024 * 1024,
      windowsHide: true,
      encoding: 'buffer'
    })

    let output
    if (isWindows) {
      output = iconv.decode(stdout || stderr, 'gbk')
    } else {
      output = (stdout || stderr).toString()
    }

    return {
      success: true,
      output,
      isWindows,
      host,
      count: pingCount
    }
  } catch (error) {
    if (error.killed) {
      return {
        success: false,
        error: 'Ping 操作超时，请稍后重试',
        isWindows,
        host
      }
    }

    let output = ''
    if (isWindows) {
      output = iconv.decode(error.stdout || error.stderr || Buffer.from(''), 'gbk')
    } else {
      output = (error.stdout || error.stderr || '').toString()
    }

    if (output.includes('请求找不到主机') || output.includes('could not find host') ||
        output.includes('Name or service not known') || output.includes('non-existent domain')) {
      return {
        success: false,
        error: '无法解析主机名，请检查地址是否正确',
        isWindows,
        host,
        output
      }
    }

    if (output.includes('无法访问目标主机') || output.includes('Destination Host Unreachable') ||
        output.includes('Network is unreachable')) {
      return {
        success: false,
        error: '目标主机不可达，网络可能存在问题',
        isWindows,
        host,
        output
      }
    }

    if (output) {
      return {
        success: true,
        output,
        isWindows,
        host,
        count: pingCount
      }
    }

    return {
      success: false,
      error: error.message || 'Ping 执行失败',
      isWindows,
      host
    }
  }
})

// Whois 查询功能
const WHOIS_SERVERS = {
  'com': 'whois.verisign-grs.com',
  'net': 'whois.verisign-grs.com',
  'org': 'whois.pir.org',
  'cn': 'whois.cnnic.cn',
  'io': 'whois.nic.io',
  'co': 'whois.nic.co',
  'xyz': 'whois.nic.xyz',
  'info': 'whois.afilias.net',
  'biz': 'whois.neulevel.biz',
  'me': 'whois.nic.me',
  'tv': 'whois.nic.tv',
  'cc': 'whois.nic.cc',
  'ai': 'whois.nic.ai',
}

function queryWhois(server, domain, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket()
    let data = ''

    socket.setTimeout(timeout)

    socket.on('connect', () => {
      socket.write(domain + '\r\n')
    })

    socket.on('data', (chunk) => {
      data += chunk.toString()
    })

    socket.on('close', () => {
      resolve(data)
    })

    socket.on('timeout', () => {
      socket.destroy()
      reject(new Error('Whois 查询超时'))
    })

    socket.on('error', (err) => {
      reject(err)
    })

    socket.connect(43, server)
  })
}

ipcMain.handle('whois', async (event, { domain }) => {
  try {
    const tld = domain.split('.').pop().toLowerCase()
    const server = WHOIS_SERVERS[tld] || 'whois.iana.org'

    let output = await queryWhois(server, domain)

    const referralMatch = output.match(/refer:\s*([^\s]+)/i)
    if (referralMatch && referralMatch[1]) {
      const referServer = referralMatch[1].trim()
      if (referServer !== server) {
        try {
          output = await queryWhois(referServer, domain)
        } catch {
          // 使用原始输出
        }
      }
    }

    if (!output || output.trim().length === 0) {
      return {
        success: false,
        error: '未找到该域名的 Whois 信息'
      }
    }

    return {
      success: true,
      output,
      domain
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Whois 查询失败',
      domain
    }
  }
})

// HTTP 检查功能
function httpRequest(urlStr, method = 'GET', timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    let dnsTime = 0
    let connectTime = 0

    try {
      const parsedUrl = new URL(urlStr)
      const isHttps = parsedUrl.protocol === 'https:'
      const httpModule = isHttps ? https : http

      const dnsStart = Date.now()
      dns.lookup(parsedUrl.hostname, (dnsErr, address, family) => {
        dnsTime = Date.now() - dnsStart

        if (dnsErr) {
          reject(new Error(`DNS 查询失败: ${dnsErr.message}`))
          return
        }

        const options = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (isHttps ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          method: method,
          headers: {
            'User-Agent': 'WzwToolBox/1.0',
            'Accept': '*/*'
          },
          timeout: timeout
        }

        const connectStart = Date.now()
        const req = httpModule.request(options, (res) => {
          connectTime = Date.now() - connectStart
          const totalTime = Date.now() - startTime

          let body = ''
          res.on('data', (chunk) => {
            body += chunk
          })

          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body.substring(0, 1024),
              contentLength: parseInt(res.headers['content-length']) || body.length,
              contentType: res.headers['content-type'],
              server: res.headers['server'],
              url: urlStr,
              dnsTime,
              connectTime,
              totalTime,
              redirected: res.socket?.encrypted || false,
              redirectCount: 0,
              redirectUrls: []
            })
          })
        })

        req.on('error', (err) => {
          reject(new Error(`HTTP 请求失败: ${err.message}`))
        })

        req.on('timeout', () => {
          req.destroy()
          reject(new Error('HTTP 请求超时'))
        })

        req.end()
      })
    } catch (err) {
      reject(new Error(`URL 解析失败: ${err.message}`))
    }
  })
}

ipcMain.handle('http-check', async (event, { url, method }) => {
  try {
    const result = await httpRequest(url, method || 'GET', 10000)
    return {
      success: true,
      data: result
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'HTTP 检查失败'
    }
  }
})

// 哈希生成功能
ipcMain.handle('compute-hash', async (event, { text, algorithm }) => {
  try {
    const hash = crypto.createHash(algorithm).update(text, 'utf8').digest('hex')
    return {
      success: true,
      hash,
      algorithm
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || '哈希生成失败'
    }
  }
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
