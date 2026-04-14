import { useState, useCallback } from 'react'
import './HttpCheck.css'

const QUICK_URLS = [
  { name: 'Google', url: 'https://google.com' },
  { name: '百度', url: 'https://baidu.com' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'Cloudflare', url: 'https://cloudflare.com' },
  { name: '阿里云', url: 'https://aliyun.com' },
]

const HTTP_METHODS = ['GET', 'HEAD', 'OPTIONS']

function HttpCheck() {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState('GET')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const parseUrl = (inputUrl) => {
    let parsedUrl = inputUrl.trim()

    if (!parsedUrl.startsWith('http://') && !parsedUrl.startsWith('https://')) {
      parsedUrl = 'https://' + parsedUrl
    }

    try {
      return new URL(parsedUrl)
    } catch {
      return null
    }
  }

  const runHttpCheck = useCallback(async () => {
    const parsedUrl = parseUrl(url)

    if (!parsedUrl) {
      setError('请输入有效的 URL 地址')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      if (window.electronAPI?.httpCheck) {
        const response = await window.electronAPI.httpCheck(parsedUrl.href, method)

        if (response.success) {
          setResult(response.data)
        } else {
          setError(response.error || 'HTTP 检查失败')
        }
      } else {
        setError('HTTP 检查功能不可用，请检查 Electron 环境')
      }
    } catch (err) {
      setError(err.message || 'HTTP 检查失败')
    } finally {
      setLoading(false)
    }
  }, [url, method])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading && url.trim()) {
      runHttpCheck()
    }
  }

  const quickCheck = (quickUrl) => {
    setUrl(quickUrl)
    setTimeout(() => {
      runHttpCheck()
    }, 100)
  }

  const clearResults = () => {
    setResult(null)
    setError(null)
  }

  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return 'success'
    if (statusCode >= 300 && statusCode < 400) return 'redirect'
    if (statusCode >= 400 && statusCode < 500) return 'client-error'
    if (statusCode >= 500) return 'server-error'
    return 'unknown'
  }

  const getStatusText = (statusCode) => {
    const statusTexts = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      301: 'Moved Permanently',
      302: 'Found',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      408: 'Request Timeout',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    }
    return statusTexts[statusCode] || ''
  }

  return (
    <div className="http-check">
      <div className="query-section">
        <div className="input-row">
          <select
            className="method-select"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            disabled={loading}
          >
            {HTTP_METHODS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="text"
            className="url-input"
            placeholder="请输入 URL 地址 (例如: https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="check-btn"
            onClick={runHttpCheck}
            disabled={loading || !url.trim()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                检查中...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                检查
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
            <h3>HTTP 检查结果</h3>
            <span className="url-info">{result.url}</span>
          </div>

          <div className="status-section">
            <div className={`status-badge ${getStatusColor(result.statusCode)}`}>
              <span className="status-code">{result.statusCode}</span>
              <span className="status-text">{getStatusText(result.statusCode)}</span>
            </div>
            <div className="timing-info">
              <div className="timing-item">
                <span className="timing-label">DNS 解析</span>
                <span className="timing-value">{result.dnsTime} ms</span>
              </div>
              <div className="timing-item">
                <span className="timing-label">连接建立</span>
                <span className="timing-value">{result.connectTime} ms</span>
              </div>
              <div className="timing-item highlight">
                <span className="timing-label">总耗时</span>
                <span className="timing-value">{result.totalTime} ms</span>
              </div>
            </div>
          </div>

          <div className="headers-section">
            <h4>响应头信息</h4>
            <div className="headers-list">
              {Object.entries(result.headers).map(([key, value]) => (
                <div key={key} className="header-item">
                  <span className="header-key">{key}</span>
                  <span className="header-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {result.contentLength !== null && (
            <div className="content-info">
              <div className="content-item">
                <span className="content-label">内容长度</span>
                <span className="content-value">{result.contentLength} bytes</span>
              </div>
              <div className="content-item">
                <span className="content-label">内容类型</span>
                <span className="content-value">{result.contentType || '-'}</span>
              </div>
              <div className="content-item">
                <span className="content-label">服务器</span>
                <span className="content-value">{result.server || '-'}</span>
              </div>
            </div>
          )}

          {result.redirected && result.redirectCount > 0 && (
            <div className="redirect-info">
              <div className="redirect-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <span>重定向 ({result.redirectCount} 次)</span>
              </div>
              <div className="redirect-urls">
                {result.redirectUrls.map((redirectUrl, index) => (
                  <div key={index} className="redirect-url">
                    <span className="redirect-num">{index + 1}</span>
                    <span className="redirect-target">{redirectUrl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="quick-check-section">
        <h4>快速检查</h4>
        <div className="quick-check-buttons">
          {QUICK_URLS.map(item => (
            <button
              key={item.url}
              onClick={() => quickCheck(item.url)}
              disabled={loading}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="http-info-section">
        <h4>HTTP 状态码参考</h4>
        <div className="status-codes">
          <div className="status-group success">
            <span className="group-label">2xx 成功</span>
            <span className="group-desc">200 OK, 201 Created, 204 No Content</span>
          </div>
          <div className="status-group redirect">
            <span className="group-label">3xx 重定向</span>
            <span className="group-desc">301 Moved, 302 Found, 304 Not Modified</span>
          </div>
          <div className="status-group client-error">
            <span className="group-label">4xx 客户端错误</span>
            <span className="group-desc">400 Bad Request, 401 Unauthorized, 404 Not Found</span>
          </div>
          <div className="status-group server-error">
            <span className="group-label">5xx 服务器错误</span>
            <span className="group-desc">500 Internal Error, 502 Bad Gateway, 503 Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HttpCheck
