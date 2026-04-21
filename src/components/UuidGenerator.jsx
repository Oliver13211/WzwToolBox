import { useState, useCallback } from 'react'
import './UuidGenerator.css'

function UuidGenerator() {
  const [uuid, setUuid] = useState('')
  const [copied, setCopied] = useState(false)
  const [count, setCount] = useState(1)

  const generateUUID = useCallback(() => {
    const pattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    return pattern.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }, [])

  const handleGenerate = useCallback(() => {
    const uuids = []
    for (let i = 0; i < count; i++) {
      uuids.push(generateUUID())
    }
    setUuid(uuids.join('\n'))
  }, [count, generateUUID])

  const handleCopy = useCallback(async () => {
    if (!uuid) return
    try {
      await navigator.clipboard.writeText(uuid)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败', err)
    }
  }, [uuid])

  const handleClear = useCallback(() => {
    setUuid('')
  }, [])

  return (
    <div className="uuid-generator">
      <div className="generator-header">
        <div className="count-selector">
          <label>生成数量</label>
          <div className="count-controls">
            <button
              className="count-btn"
              onClick={() => setCount(Math.max(1, count - 1))}
              disabled={count <= 1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <span className="count-value">{count}</span>
            <button
              className="count-btn"
              onClick={() => setCount(Math.min(20, count + 1))}
              disabled={count >= 20}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
        <button className="generate-btn" onClick={handleGenerate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
          </svg>
          生成 UUID
        </button>
      </div>

      {uuid && (
        <div className="uuid-output-section">
          <div className="section-header">
            <label>生成的 UUID</label>
            <div className="section-actions">
              <span className="uuid-count">{uuid.split('\n').length} 个</span>
              <button className="action-btn-text" onClick={handleClear}>清空</button>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>
          <textarea
            className="uuid-output"
            value={uuid}
            readOnly
            rows={Math.min(count + 1, 12)}
          />
        </div>
      )}

      <div className="info-section">
        <h4>关于 UUID</h4>
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
              <span className="info-title">格式说明</span>
              <span className="info-desc">UUID v4 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="info-text">
              <span className="info-title">唯一性</span>
              <span className="info-desc">基于随机数生成，重复概率极低，适合作为唯一标识符</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UuidGenerator