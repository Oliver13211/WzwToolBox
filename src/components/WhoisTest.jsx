import { useState, useCallback } from 'react'
import './WhoisTest.css'

const QUICK_DOMAINS = [
  { name: 'Google', domain: 'google.com' },
  { name: '百度', domain: 'baidu.com' },
  { name: 'GitHub', domain: 'github.com' },
  { name: '阿里云', domain: 'aliyun.com' },
  { name: '腾讯', domain: 'qq.com' },
]

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

function WhoisTest() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [rawOutput, setRawOutput] = useState('')

  const parseWhoisOutput = (output) => {
    const info = {
      domainName: '',
      registrar: '',
      createdDate: '',
      updatedDate: '',
      expiryDate: '',
      status: [],
      nameservers: [],
      registrant: {},
      admin: {},
      tech: {},
    }

    const lines = output.split('\n')

    for (const line of lines) {
      const lowerLine = line.toLowerCase()

      if (lowerLine.includes('domain name:') || lowerLine.includes('domain:')) {
        const match = line.match(/domain\s*name[:：]\s*(.+)/i) || line.match(/domain[:：]\s*(.+)/i)
        if (match && !info.domainName) {
          info.domainName = match[1].trim()
        }
      }

      if (lowerLine.includes('registrar:') || lowerLine.includes('registrar name:')) {
        const match = line.match(/registrar\s*(name)?[:：]\s*(.+)/i)
        if (match) {
          info.registrar = match[2].trim()
        }
      }

      if (lowerLine.includes('creation date:') || lowerLine.includes('created:') || lowerLine.includes('registered:')) {
        const match = line.match(/(creation\s*date|created|registered)[:：]\s*(.+)/i)
        if (match) {
          info.createdDate = match[2].trim()
        }
      }

      if (lowerLine.includes('updated date:') || lowerLine.includes('last updated:') || lowerLine.includes('modified:')) {
        const match = line.match(/(updated\s*date|last\s*updated|modified)[:：]\s*(.+)/i)
        if (match) {
          info.updatedDate = match[2].trim()
        }
      }

      if (lowerLine.includes('expiry date:') || lowerLine.includes('expires:') || lowerLine.includes('registry expiry:')) {
        const match = line.match(/(expiry\s*date|expires|registry\s*expiry)[:：]\s*(.+)/i)
        if (match) {
          info.expiryDate = match[2].trim()
        }
      }

      if (lowerLine.includes('status:') || lowerLine.includes('domain status:')) {
        const match = line.match(/(domain\s*)?status[:：]\s*(.+)/i)
        if (match) {
          const status = match[2].trim()
          if (status && !info.status.includes(status)) {
            info.status.push(status)
          }
        }
      }

      if (lowerLine.includes('name server:') || lowerLine.includes('nserver:')) {
        const match = line.match(/name\s*server[:：]\s*(.+)/i) || line.match(/nserver[:：]\s*(.+)/i)
        if (match) {
          const ns = match[1].trim().toLowerCase()
          if (ns && !info.nameservers.includes(ns)) {
            info.nameservers.push(ns)
          }
        }
      }

      if (lowerLine.includes('registrant')) {
        if (lowerLine.includes('registrant name:')) {
          const match = line.match(/registrant\s*name[:：]\s*(.+)/i)
          if (match) info.registrant.name = match[1].trim()
        }
        if (lowerLine.includes('registrant organization:') || lowerLine.includes('registrant org:')) {
          const match = line.match(/registrant\s*(organization|org)[:：]\s*(.+)/i)
          if (match) info.registrant.organization = match[2].trim()
        }
        if (lowerLine.includes('registrant country:')) {
          const match = line.match(/registrant\s*country[:：]\s*(.+)/i)
          if (match) info.registrant.country = match[1].trim()
        }
        if (lowerLine.includes('registrant email:')) {
          const match = line.match(/registrant\s*email[:：]\s*(.+)/i)
          if (match) info.registrant.email = match[1].trim()
        }
      }
    }

    return info
  }

  const runWhois = useCallback(async () => {
    if (!domain.trim()) {
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setRawOutput('')

    try {
      if (window.electronAPI?.whois) {
        const response = await window.electronAPI.whois(domain.trim())

        if (response.success) {
          setRawOutput(response.output)
          const parsed = parseWhoisOutput(response.output)
          setResult(parsed)
        } else {
          setError(response.error || 'Whois 查询失败')
        }
      } else {
        setError('Whois 功能不可用，请检查 Electron 环境')
      }
    } catch (err) {
      setError(err.message || 'Whois 查询失败')
    } finally {
      setLoading(false)
    }
  }, [domain])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading && domain.trim()) {
      runWhois()
    }
  }

  const quickQuery = (quickDomain) => {
    setDomain(quickDomain)
    setTimeout(() => {
      runWhois()
    }, 100)
  }

  const clearResults = () => {
    setResult(null)
    setRawOutput('')
    setError(null)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="whois-test">
      <div className="query-section">
        <div className="input-row">
          <input
            type="text"
            className="domain-input"
            placeholder="请输入域名 (例如: example.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="query-btn"
            onClick={runWhois}
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
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                查询
              </>
            )}
          </button>
          {result && (
            <button className="clear-btn" onClick={clearResults}>
              清空
            </button>
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
      </div>

      {result && (
        <div className="results-section">
          <div className="results-header">
            <h3>Whois 查询结果</h3>
            <span className="domain-info">{domain}</span>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">域名</span>
              <span className="info-value">{result.domainName || domain}</span>
            </div>
            <div className="info-item">
              <span className="info-label">注册商</span>
              <span className="info-value">{result.registrar || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">创建时间</span>
              <span className="info-value">{formatDate(result.createdDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">更新时间</span>
              <span className="info-value">{formatDate(result.updatedDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">到期时间</span>
              <span className="info-value">{formatDate(result.expiryDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">注册人</span>
              <span className="info-value">{result.registrant?.name || result.registrant?.organization || '-'}</span>
            </div>
          </div>

          {result.status.length > 0 && (
            <div className="status-section">
              <h4>域名状态</h4>
              <div className="status-list">
                {result.status.map((status, index) => (
                  <span key={index} className="status-tag">{status}</span>
                ))}
              </div>
            </div>
          )}

          {result.nameservers.length > 0 && (
            <div className="nameservers-section">
              <h4>名称服务器</h4>
              <div className="nameserver-list">
                {result.nameservers.map((ns, index) => (
                  <span key={index} className="nameserver-tag">{ns}</span>
                ))}
              </div>
            </div>
          )}

          <div className="raw-output-section">
            <div className="raw-header">
              <h4>原始输出</h4>
              <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(rawOutput)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                复制
              </button>
            </div>
            <pre className="raw-output">{rawOutput}</pre>
          </div>
        </div>
      )}

      <div className="quick-query-section">
        <h4>快速查询</h4>
        <div className="quick-query-buttons">
          {QUICK_DOMAINS.map(item => (
            <button
              key={item.domain}
              onClick={() => quickQuery(item.domain)}
              disabled={loading}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="whois-info-section">
        <h4>关于 Whois</h4>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </div>
            <div className="info-content">
              <span className="info-title">什么是 Whois</span>
              <span className="info-desc">Whois 是用于查询域名注册信息的协议，可查看域名所有者、注册商、到期时间等信息</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="info-content">
              <span className="info-title">隐私保护</span>
              <span className="info-desc">部分域名启用了隐私保护，注册人信息可能被隐藏或显示为代理信息</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhoisTest
