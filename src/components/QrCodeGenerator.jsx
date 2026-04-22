import { useState, useCallback, useRef } from 'react'
import QRCode from 'qrcode'
import './QrCodeGenerator.css'

function QrCodeGenerator() {
  const [text, setText] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [error, setError] = useState('')
  const [size, setSize] = useState(256)
  const canvasRef = useRef(null)

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      setError('请输入需要生成二维码的文本或URL')
      return
    }
    setError('')
    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      setQrDataUrl(dataUrl)
    } catch (err) {
      setError('生成失败：' + err.message)
    }
  }, [text, size])

  const handleDownload = useCallback(() => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = qrDataUrl
    link.click()
  }, [qrDataUrl])

  const handleClear = useCallback(() => {
    setText('')
    setQrDataUrl('')
    setError('')
  }, [])

  return (
    <div className="qrcode-generator">
      <div className="input-section">
        <div className="section-header">
          <label>文本或 URL</label>
          {text && (
            <button className="clear-btn" onClick={handleClear}>清空</button>
          )}
        </div>
        <textarea
          className="qrcode-input"
          placeholder="请输入需要生成二维码的文本或URL..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />
      </div>

      <div className="options-row">
        <div className="size-selector">
          <label>图片尺寸</label>
          <div className="size-controls">
            <button
              className="size-btn"
              onClick={() => setSize(Math.max(128, size - 64))}
              disabled={size <= 128}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <span className="size-value">{size}px</span>
            <button
              className="size-btn"
              onClick={() => setSize(Math.min(512, size + 64))}
              disabled={size >= 512}
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
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="3" height="3"/>
            <rect x="18" y="14" width="3" height="3"/>
            <rect x="14" y="18" width="3" height="3"/>
            <rect x="18" y="18" width="3" height="3"/>
          </svg>
          生成二维码
        </button>
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

      {qrDataUrl && (
        <div className="output-section">
          <div className="section-header">
            <label>生成的二维码</label>
            <button className="download-btn" onClick={handleDownload}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              下载图片
            </button>
          </div>
          <div className="qrcode-preview">
            <img src={qrDataUrl} alt="Generated QR Code" />
          </div>
        </div>
      )}

      <div className="info-section">
        <h4>关于二维码生成</h4>
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
              <span className="info-title">支持格式</span>
              <span className="info-desc">文本、URL、邮箱、电话等多种内容格式</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div className="info-text">
              <span className="info-title">下载功能</span>
              <span className="info-desc">生成 PNG 格式图片，可直接下载保存</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QrCodeGenerator