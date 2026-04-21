import { useState, useCallback } from 'react'
import './UrlEncoder.css'

function UrlEncoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encode')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleEncode = useCallback(() => {
    if (!input.trim()) {
      setError('请输入需要编码的文本')
      return
    }
    setError('')
    try {
      const encoded = encodeURIComponent(input)
      setOutput(encoded)
    } catch (err) {
      setError('编码失败：' + err.message)
    }
  }, [input])

  const handleDecode = useCallback(() => {
    if (!input.trim()) {
      setError('请输入需要解码的 URL 文本')
      return
    }
    setError('')
    try {
      const decoded = decodeURIComponent(input.trim())
      setOutput(decoded)
    } catch (err) {
      setError('解码失败：无效的 URL 编码格式')
    }
  }, [input])

  const handleSwap = useCallback(() => {
    setInput(output)
    setOutput('')
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setError('')
  }, [output, mode])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError('')
  }, [])

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('复制失败')
    }
  }, [output])

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setOutput('')
    setError('')
  }

  return (
    <div className="url-encoder">
      <div className="mode-selector">
        <button
          className={`mode-btn ${mode === 'encode' ? 'active' : ''}`}
          onClick={() => handleModeChange('encode')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          编码
        </button>
        <button
          className={`mode-btn ${mode === 'decode' ? 'active' : ''}`}
          onClick={() => handleModeChange('decode')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          解码
        </button>
      </div>

      <div className="input-section">
        <div className="section-header">
          <label>{mode === 'encode' ? '原文' : 'URL 编码文本'}</label>
          <div className="section-actions">
            <span className="char-count">{input.length} 字符</span>
            {input && (
              <button className="clear-btn" onClick={handleClear}>清空</button>
            )}
          </div>
        </div>
        <textarea
          className="codec-input"
          placeholder={mode === 'encode' ? '请输入需要编码的文本...' : '请输入需要解码的 URL 编码文本...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
        />
      </div>

      <div className="action-row">
        <button
          className="action-btn primary"
          onClick={mode === 'encode' ? handleEncode : handleDecode}
        >
          {mode === 'encode' ? '编码' : '解码'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
        {output && (
          <button className="action-btn swap" onClick={handleSwap} title="交换输入输出">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="17 1 21 5 17 9"/>
              <path d="M3 11V9a4 4 0 014-4h14"/>
              <polyline points="7 23 3 19 7 15"/>
              <path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
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

      {output && (
        <div className="output-section">
          <div className="section-header">
            <label>{mode === 'encode' ? 'URL 编码结果' : '解码结果'}</label>
            <button className="copy-btn" onClick={handleCopy}>
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <textarea
            className="codec-output"
            value={output}
            readOnly
            rows={6}
          />
        </div>
      )}

      <div className="info-section">
        <h4>关于 URL 编码</h4>
        <div className="info-content">
          <div className="info-item">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </div>
            <div className="info-text">
              <span className="info-title">编码</span>
              <span className="info-desc">将特殊字符转换为 %XX 格式，确保 URL 传输安全</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </div>
            <div className="info-text">
              <span className="info-title">解码</span>
              <span className="info-desc">将 URL 编码格式还原为原始文本</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UrlEncoder