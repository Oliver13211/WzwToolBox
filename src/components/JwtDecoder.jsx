import { useState, useCallback } from 'react'
import './JwtDecoder.css'

function JwtDecoder() {
  const [token, setToken] = useState('')
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState({ header: false, payload: false })

  const decodeBase64 = (str) => {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const padding = base64.length % 4
    const padded = padding ? base64 + '='.repeat(4 - padding) : base64
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  }

  const handleDecode = useCallback(() => {
    if (!token.trim()) {
      setError('请输入需要解析的 JWT Token')
      return
    }
    setError('')
    setParsed(null)

    try {
      const parts = token.trim().split('.')
      if (parts.length !== 3) {
        setError('无效的 JWT 格式，请检查 Token 是否完整')
        return
      }

      const header = JSON.parse(decodeBase64(parts[0]))
      const payload = JSON.parse(decodeBase64(parts[1]))
      const signature = parts[2]

      const isExpired = payload.exp && payload.exp < Date.now() / 1000
      const isNotYetValid = payload.nbf && payload.nbf > Date.now() / 1000

      setParsed({
        header,
        payload,
        signature,
        isExpired,
        isNotYetValid,
        formatted: {
          header: JSON.stringify(header, null, 2),
          payload: JSON.stringify(payload, null, 2)
        }
      })
    } catch (err) {
      setError('解析失败：无效的 JWT Token 格式')
    }
  }, [token])

  const handleClear = useCallback(() => {
    setToken('')
    setParsed(null)
    setError('')
  }, [])

  const handleCopy = useCallback(async (part, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied((prev) => ({ ...prev, [part]: true }))
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [part]: false }))
      }, 2000)
    } catch (err) {
      console.error('复制失败', err)
    }
  }, [])

  const formatTime = (timestamp) => {
    if (!timestamp) return '无'
    const date = new Date(timestamp * 1000)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="jwt-decoder">
      <div className="input-section">
        <div className="section-header">
          <label>JWT Token</label>
          {token && (
            <button className="clear-btn" onClick={handleClear}>清空</button>
          )}
        </div>
        <textarea
          className="jwt-input"
          placeholder="请输入需要解析的 JWT Token..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
        />
      </div>

      <button className="decode-btn" onClick={handleDecode}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
        </svg>
        解析 Token
      </button>

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

      {parsed && (
        <>
          {parsed.isExpired && (
            <div className="warning-message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Token 已过期（过期时间：{formatTime(parsed.payload.exp)}）
            </div>
          )}

          {parsed.isNotYetValid && (
            <div className="warning-message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Token 尚未生效（生效时间：{formatTime(parsed.payload.nbf)}）
            </div>
          )}

          <div className="claims-section">
            <div className="claim-card">
              <div className="claim-header">
                <span className="claim-label">Header</span>
                <button
                  className="copy-btn-small"
                  onClick={() => handleCopy('header', parsed.formatted.header)}
                >
                  {copied.header ? '已复制' : '复制'}
                </button>
              </div>
              <pre className="claim-content">{parsed.formatted.header}</pre>
            </div>

            <div className="claim-card">
              <div className="claim-header">
                <span className="claim-label">Payload</span>
                <button
                  className="copy-btn-small"
                  onClick={() => handleCopy('payload', parsed.formatted.payload)}
                >
                  {copied.payload ? '已复制' : '复制'}
                </button>
              </div>
              <pre className="claim-content">{parsed.formatted.payload}</pre>
            </div>

            <div className="claim-card signature-card">
              <div className="claim-header">
                <span className="claim-label">Signature</span>
              </div>
              <pre className="claim-content signature">{parsed.signature}</pre>
            </div>
          </div>

          <div className="time-claims">
            <h4>时间相关声明</h4>
            <div className="time-grid">
              <div className="time-item">
                <span className="time-label">签发时间 (iat)</span>
                <span className="time-value">{formatTime(parsed.payload.iat)}</span>
              </div>
              <div className="time-item">
                <span className="time-label">过期时间 (exp)</span>
                <span className="time-value">{formatTime(parsed.payload.exp)}</span>
              </div>
              <div className="time-item">
                <span className="time-label">生效时间 (nbf)</span>
                <span className="time-value">{formatTime(parsed.payload.nbf)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="info-section">
        <h4>关于 JWT</h4>
        <div className="info-content">
          <div className="info-item">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="info-text">
              <span className="info-title">结构</span>
              <span className="info-desc">Header.Payload.Signature 三部分组成</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="info-text">
              <span className="info-title">安全说明</span>
              <span className="info-desc">仅解析和显示内容，不验证签名有效性</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JwtDecoder