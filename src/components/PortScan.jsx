import { useState, useCallback, useEffect } from 'react'
import './PortScan.css'

const COMMON_PORTS = [
  { port: 21, service: 'FTP', description: '文件传输协议', category: 'file' },
  { port: 22, service: 'SSH', description: '安全外壳协议', category: 'remote' },
  { port: 23, service: 'Telnet', description: '远程登录协议', category: 'remote' },
  { port: 25, service: 'SMTP', description: '简单邮件传输协议', category: 'mail' },
  { port: 53, service: 'DNS', description: '域名系统', category: 'network' },
  { port: 80, service: 'HTTP', description: '超文本传输协议', category: 'web' },
  { port: 110, service: 'POP3', description: '邮局协议', category: 'mail' },
  { port: 143, service: 'IMAP', description: '互联网邮件访问协议', category: 'mail' },
  { port: 443, service: 'HTTPS', description: '安全超文本传输协议', category: 'web' },
  { port: 445, service: 'SMB', description: '服务器消息块', category: 'file' },
  { port: 3306, service: 'MySQL', description: 'MySQL 数据库', category: 'database' },
  { port: 3389, service: 'RDP', description: '远程桌面协议', category: 'remote' },
  { port: 5432, service: 'PostgreSQL', description: 'PostgreSQL 数据库', category: 'database' },
  { port: 6379, service: 'Redis', description: 'Redis 缓存数据库', category: 'database' },
  { port: 8080, service: 'HTTP-Proxy', description: 'HTTP 代理', category: 'web' },
  { port: 8443, service: 'HTTPS-Alt', description: 'HTTPS 替代端口', category: 'web' },
  { port: 27017, service: 'MongoDB', description: 'MongoDB 数据库', category: 'database' },
  { port: 9200, service: 'Elasticsearch', description: '搜索引擎', category: 'database' },
]

const PORT_CATEGORIES = {
  web: { label: 'Web 服务', color: '#00d4ff' },
  database: { label: '数据库', color: '#8a2be2' },
  remote: { label: '远程连接', color: '#ff6b6b' },
  mail: { label: '邮件服务', color: '#ffd93d' },
  file: { label: '文件传输', color: '#6bcf7f' },
  network: { label: '网络服务', color: '#ff8c42' },
}

function PortScan() {
  const [targetHost, setTargetHost] = useState('')
  const [scanType, setScanType] = useState('common')
  const [customPorts, setCustomPorts] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanResults, setScanResults] = useState(null)
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, percent: 0 })
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [error, setError] = useState(null)

  // 监听扫描进度
  useEffect(() => {
    if (window.electronAPI?.onScanProgress) {
      window.electronAPI.onScanProgress((data) => {
        setScanProgress(data)
      })
    }
  }, [])

  const handleScan = useCallback(async () => {
    if (!targetHost.trim()) {
      setError('请输入目标主机')
      return
    }

    if (scanType === 'custom' && !customPorts.trim()) {
      setError('请输入要扫描的端口号')
      return
    }

    setScanning(true)
    setScanResults(null)
    setScanProgress({ current: 0, total: 0, percent: 0 })
    setError(null)

    try {
      // 准备端口列表
      let portsToScan = []
      if (scanType === 'common') {
        portsToScan = COMMON_PORTS
      } else if (scanType === 'custom') {
        portsToScan = customPorts.split(',').map(p => {
          const portNum = parseInt(p.trim())
          return {
            port: portNum,
            service: `Port ${portNum}`,
            description: '自定义端口',
            category: 'custom'
          }
        }).filter(p => !isNaN(p.port) && p.port > 0 && p.port <= 65535)

        if (portsToScan.length === 0) {
          throw new Error('请输入有效的端口号 (1-65535)')
        }
      }

      // 使用 Electron API 进行真正的端口扫描
      if (window.electronAPI?.scanPorts) {
        const results = await window.electronAPI.scanPorts(targetHost.trim(), portsToScan)
        setScanResults(results)
      } else {
        throw new Error('端口扫描功能不可用，请检查 Electron 环境')
      }
    } catch (err) {
      setError(err.message || '扫描过程中发生错误')
    } finally {
      setScanning(false)
    }
  }, [targetHost, scanType, customPorts])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleScan()
    }
  }

  const filteredPorts = selectedCategory === 'all' 
    ? COMMON_PORTS 
    : COMMON_PORTS.filter(p => p.category === selectedCategory)

  const openPorts = scanResults?.filter(r => r.status === 'open') || []
  const closedPorts = scanResults?.filter(r => r.status === 'closed') || []

  return (
    <div className="port-scan">
      <div className="scan-section">
        <div className="input-group">
          <input
            type="text"
            className="host-input"
            placeholder="请输入目标主机 (例如: example.com 或 192.168.1.1)"
            value={targetHost}
            onChange={(e) => setTargetHost(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="scan-btn"
            onClick={handleScan}
            disabled={scanning || !targetHost.trim()}
          >
            {scanning ? (
              <>
                <span className="spinner"></span>
                扫描中...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                开始扫描
              </>
            )}
          </button>
        </div>

        <div className="scan-options">
          <div className="option-group">
            <label className="option-label">扫描类型:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="scanType"
                  value="common"
                  checked={scanType === 'common'}
                  onChange={(e) => setScanType(e.target.value)}
                />
                <span>常用端口</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="scanType"
                  value="custom"
                  checked={scanType === 'custom'}
                  onChange={(e) => setScanType(e.target.value)}
                />
                <span>自定义端口</span>
              </label>
            </div>
          </div>

          {scanType === 'custom' && (
            <div className="custom-ports-input">
              <input
                type="text"
                placeholder="输入端口号，用逗号分隔 (例如: 80,443,8080)"
                value={customPorts}
                onChange={(e) => setCustomPorts(e.target.value)}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {scanning && (
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${scanProgress.percent}%` }}
              ></div>
            </div>
            <span className="progress-text">{scanProgress.percent}%</span>
          </div>
        )}
      </div>

      {scanResults && (
        <div className="results-section">
          <div className="results-summary">
            <div className="summary-item open">
              <span className="summary-number">{openPorts.length}</span>
              <span className="summary-label">开放端口</span>
            </div>
            <div className="summary-item closed">
              <span className="summary-number">{closedPorts.length}</span>
              <span className="summary-label">关闭端口</span>
            </div>
            <div className="summary-item total">
              <span className="summary-number">{scanResults.length}</span>
              <span className="summary-label">扫描总数</span>
            </div>
          </div>

          <div className="results-table">
            <div className="table-header">
              <span>端口</span>
              <span>服务</span>
              <span>描述</span>
              <span>状态</span>
              <span>响应时间</span>
            </div>
            <div className="table-body">
              {scanResults.map((result) => (
                <div 
                  key={result.port} 
                  className={`table-row ${result.status}`}
                >
                  <span className="port-number">{result.port}</span>
                  <span className="service-name">{result.service}</span>
                  <span className="description">{result.description}</span>
                  <span className={`status-badge ${result.status}`}>
                    {result.status === 'open' ? '开放' : '关闭'}
                  </span>
                  <span className="response-time">
                    {result.responseTime === '-' ? '-' : `${result.responseTime}ms`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="ports-reference">
        <h3>常用端口参考</h3>
        
        <div className="category-filter">
          <button
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => setSelectedCategory('all')}
          >
            全部
          </button>
          {Object.entries(PORT_CATEGORIES).map(([key, { label }]) => (
            <button
              key={key}
              className={selectedCategory === key ? 'active' : ''}
              onClick={() => setSelectedCategory(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ports-grid">
          {filteredPorts.map((port) => (
            <div 
              key={port.port} 
              className="port-card"
              style={{ borderColor: PORT_CATEGORIES[port.category]?.color || '#666' }}
            >
              <div className="port-header">
                <span className="port-num">{port.port}</span>
                <span 
                  className="category-tag"
                  style={{ 
                    backgroundColor: `${PORT_CATEGORIES[port.category]?.color || '#666'}20`,
                    color: PORT_CATEGORIES[port.category]?.color || '#666'
                  }}
                >
                  {PORT_CATEGORIES[port.category]?.label || '其他'}
                </span>
              </div>
              <div className="port-service">{port.service}</div>
              <div className="port-desc">{port.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PortScan
