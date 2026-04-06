import { useState, useCallback } from 'react'
import './DNSTest.css'

const DNS_SERVERS = [
  { name: 'Google DNS', ip: '8.8.8.8', location: '美国' },
  { name: 'Google DNS 备用', ip: '8.8.4.4', location: '美国' },
  { name: 'Cloudflare', ip: '1.1.1.1', location: '全球' },
  { name: 'Cloudflare 备用', ip: '1.0.0.1', location: '全球' },
  { name: '阿里云 DNS', ip: '223.5.5.5', location: '中国' },
  { name: '阿里云 DNS 备用', ip: '223.6.6.6', location: '中国' },
  { name: '腾讯云 DNS', ip: '119.29.29.29', location: '中国' },
  { name: '百度 DNS', ip: '180.76.76.76', location: '中国' },
  { name: '114 DNS', ip: '114.114.114.114', location: '中国' },
  { name: 'OpenDNS', ip: '208.67.222.222', location: '美国' },
  { name: 'OpenDNS 备用', ip: '208.67.220.220', location: '美国' },
]

const RECORD_TYPES = [
  { type: 'A', description: 'IPv4 地址记录' },
  { type: 'AAAA', description: 'IPv6 地址记录' },
  { type: 'MX', description: '邮件交换记录' },
  { type: 'NS', description: '域名服务器记录' },
  { type: 'CNAME', description: '别名记录' },
  { type: 'TXT', description: '文本记录' },
  { type: 'SOA', description: '起始授权记录' },
]

function DNSTest() {
  const [domain, setDomain] = useState('')
  const [recordType, setRecordType] = useState('A')
  const [selectedServer, setSelectedServer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [queryTime, setQueryTime] = useState(null)

  const resolveDNS = useCallback(async () => {
    if (!domain.trim()) {
      setError('请输入域名')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)
    setQueryTime(null)

    try {
      // 使用 Electron API 进行 DNS 查询
      if (window.electronAPI?.dnsQuery) {
        const result = await window.electronAPI.dnsQuery(domain.trim(), recordType)
        
        setQueryTime(result.queryTime)

        if (result.success) {
          setResults({
            domain: result.domain,
            type: result.type,
            answers: result.answers
          })
        } else {
          setError(result.error || 'DNS 查询失败')
        }
      } else {
        throw new Error('DNS 查询功能不可用，请检查 Electron 环境')
      }
    } catch (err) {
      setError(err.message || 'DNS 查询失败')
    } finally {
      setLoading(false)
    }
  }, [domain, recordType])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      resolveDNS()
    }
  }

  const quickTest = (testDomain) => {
    setDomain(testDomain)
    setRecordType('A')
    setTimeout(() => resolveDNS(), 100)
  }

  return (
    <div className="dns-test">
      <div className="query-section">
        <div className="input-group">
          <input
            type="text"
            className="domain-input"
            placeholder="请输入域名 (例如: example.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <select
            className="record-type-select"
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
          >
            {RECORD_TYPES.map(rt => (
              <option key={rt.type} value={rt.type}>
                {rt.type} - {rt.description}
              </option>
            ))}
          </select>
          <button
            className="query-btn"
            onClick={resolveDNS}
            disabled={loading || !domain.trim()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                查询中...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
                </svg>
                查询
              </>
            )}
          </button>
        </div>

        <div className="dns-server-section">
          <label className="section-label">公共 DNS 服务器参考:</label>
          <div className="server-grid">
            {DNS_SERVERS.map(server => (
              <div key={server.ip} className="server-info">
                <span className="server-name">{server.name}</span>
                <span className="server-ip">{server.ip}</span>
              </div>
            ))}
          </div>
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
      </div>

      {results && (
        <div className="results-section">
          <div className="result-header">
            <div className="result-info">
              <h3>查询结果</h3>
              <span className="query-meta">
                {results.domain} · {results.type} 记录
                {queryTime && <span className="query-time"> · {queryTime}ms</span>}
              </span>
            </div>
            <div className="result-stats">
              <span className="stat-badge">
                {results.answers.length} 条记录
              </span>
            </div>
          </div>

          {results.answers.length > 0 ? (
            <div className="records-table">
              <div className="table-header">
                <span>记录类型</span>
                <span>TTL</span>
                <span>记录值</span>
              </div>
              <div className="table-body">
                {results.answers.map((answer, index) => (
                  <div key={index} className="table-row">
                    <span className="record-type">{answer.type}</span>
                    <span className="record-ttl">{answer.ttl}s</span>
                    <span className="record-data">{answer.data}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-records">
              <p>未找到 {results.type} 记录</p>
            </div>
          )}
        </div>
      )}

      <div className="quick-test-section">
        <h4>快速测试</h4>
        <div className="quick-test-buttons">
          <button onClick={() => quickTest('google.com')}>Google</button>
          <button onClick={() => quickTest('baidu.com')}>百度</button>
          <button onClick={() => quickTest('github.com')}>GitHub</button>
          <button onClick={() => quickTest('cloudflare.com')}>Cloudflare</button>
        </div>
      </div>

      <div className="record-types-reference">
        <h4>记录类型说明</h4>
        <div className="types-grid">
          {RECORD_TYPES.map(rt => (
            <div key={rt.type} className="type-card">
              <span className="type-code">{rt.type}</span>
              <span className="type-desc">{rt.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DNSTest
