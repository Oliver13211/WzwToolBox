import { useState, useCallback, useRef } from 'react'
import './ImageResizer.css'

function ImageResizer() {
  const [image, setImage] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resizeMode, setResizeMode] = useState('scale')
  const [scale, setScale] = useState(100)
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [maintainRatio, setMaintainRatio] = useState(true)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const initialWidth = img.width
        const initialHeight = img.height
        setImage({
          file,
          url: e.target.result,
          width: initialWidth,
          height: initialHeight,
          name: file.name,
          size: file.size,
          type: file.type,
          originalWidth: img.width,
          originalHeight: img.height
        })
        setCustomWidth(String(img.width))
        setCustomHeight(String(img.height))
        setPreviewUrl(e.target.result)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  }

  const handleWidthChange = (value) => {
    setCustomWidth(value)
    if (maintainRatio && image) {
      const ratio = image.originalHeight / image.originalWidth
      setCustomHeight(String(Math.round(Number(value) * ratio)))
    }
  }

  const handleHeightChange = (value) => {
    setCustomHeight(value)
    if (maintainRatio && image) {
      const ratio = image.originalWidth / image.originalHeight
      setCustomWidth(String(Math.round(Number(value) * ratio)))
    }
  }

  const calculatePreview = useCallback(() => {
    if (!image) return

    setIsProcessing(true)
    const img = new Image()
    img.onload = () => {
      let newWidth, newHeight

      if (resizeMode === 'scale') {
        newWidth = Math.round(img.width * (scale / 100))
        newHeight = Math.round(img.height * (scale / 100))
      } else {
        newWidth = Number(customWidth) || img.width
        newHeight = Number(customHeight) || img.height
      }

      const canvas = document.createElement('canvas')
      canvas.width = newWidth
      canvas.height = newHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      const dataUrl = canvas.toDataURL(image.type, 0.92)
      setPreviewUrl(dataUrl)
      setIsProcessing(false)
    }
    img.src = image.url
  }, [image, resizeMode, scale, customWidth, customHeight])

  const handleDownload = () => {
    if (!previewUrl) return

    const link = document.createElement('a')
    const ext = image.type.split('/')[1]
    const baseName = image.name.replace(/\.[^.]+$/, '')
    link.href = previewUrl
    link.download = `${baseName}_resized.${ext}`
    link.click()
  }

  const handleClear = () => {
    if (image?.url && image.url.startsWith('blob:')) {
      URL.revokeObjectURL(image.url)
    }
    setImage(null)
    setPreviewUrl(null)
    setScale(100)
    setCustomWidth('')
    setCustomHeight('')
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getNewDimensions = () => {
    if (!image) return { width: 0, height: 0 }

    if (resizeMode === 'scale') {
      return {
        width: Math.round(image.originalWidth * (scale / 100)),
        height: Math.round(image.originalHeight * (scale / 100))
      }
    } else {
      return {
        width: Number(customWidth) || image.originalWidth,
        height: Number(customHeight) || image.originalHeight
      }
    }
  }

  const newDims = getNewDimensions()
  const sizeRatio = image ? (newDims.width * newDims.height) / (image.originalWidth * image.originalHeight) : 1

  return (
    <div className="image-resizer">
      <div className="resizer-toolbar">
        <div className="toolbar-section">
          <span className="toolbar-label">调整模式:</span>
          <div className="mode-buttons">
            <button
              className={`mode-btn ${resizeMode === 'scale' ? 'active' : ''}`}
              onClick={() => setResizeMode('scale')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 3v18H3"/>
              </svg>
              按比例
            </button>
            <button
              className={`mode-btn ${resizeMode === 'custom' ? 'active' : ''}`}
              onClick={() => setResizeMode('custom')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
              自定义尺寸
            </button>
          </div>
        </div>

        <div className="toolbar-actions">
          <button
            className="action-btn primary"
            onClick={calculatePreview}
            disabled={!image || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner"></span>
                处理中...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                开始调整
              </>
            )}
          </button>
          <button className="action-btn" onClick={handleClear} disabled={!image}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
            清空
          </button>
        </div>
      </div>

      <div className="resizer-main">
        <div className="settings-panel">
          <div className="settings-section">
            <h3>原始图片信息</h3>
            {image ? (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">文件名</span>
                  <span className="info-value">{image.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">原始尺寸</span>
                  <span className="info-value">{image.originalWidth} × {image.originalHeight}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">文件大小</span>
                  <span className="info-value">{formatSize(image.size)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">格式</span>
                  <span className="info-value">{image.type.split('/')[1].toUpperCase()}</span>
                </div>
              </div>
            ) : (
              <div className="empty-info">
                <p>请上传图片</p>
              </div>
            )}
          </div>

          <div className="settings-section">
            <h3>调整参数</h3>
            {resizeMode === 'scale' ? (
              <div className="scale-control">
                <label className="scale-label">
                  <span>缩放比例: {scale}%</span>
                  <input
                    type="range"
                    min="1"
                    max="200"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="scale-slider"
                  />
                </label>
                <div className="scale-presets">
                  <button onClick={() => setScale(25)} className={scale === 25 ? 'active' : ''}>25%</button>
                  <button onClick={() => setScale(50)} className={scale === 50 ? 'active' : ''}>50%</button>
                  <button onClick={() => setScale(75)} className={scale === 75 ? 'active' : ''}>75%</button>
                  <button onClick={() => setScale(100)} className={scale === 100 ? 'active' : ''}>100%</button>
                  <button onClick={() => setScale(150)} className={scale === 150 ? 'active' : ''}>150%</button>
                  <button onClick={() => setScale(200)} className={scale === 200 ? 'active' : ''}>200%</button>
                </div>
              </div>
            ) : (
              <div className="dimension-controls">
                <div className="dimension-input">
                  <label>宽度 (px)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    placeholder="宽度"
                    min="1"
                  />
                </div>
                <button
                  className={`ratio-toggle ${maintainRatio ? 'active' : ''}`}
                  onClick={() => setMaintainRatio(!maintainRatio)}
                  title={maintainRatio ? '取消锁定比例' : '锁定比例'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {maintainRatio ? (
                      <path d="M16 3h5v5M8 21H3v-5M21 3l-7 7M3 21l7-7"/>
                    ) : (
                      <path d="M16 3h5v5M8 21H3v-5M21 3l-7 7M3 21l7-7"/>
                    )}
                  </svg>
                </button>
                <div className="dimension-input">
                  <label>高度 (px)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    placeholder="高度"
                    min="1"
                  />
                </div>
              </div>
            )}
          </div>

          {image && (
            <div className="settings-section result-info">
              <h3>输出结果</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">新尺寸</span>
                  <span className="info-value highlight">{newDims.width} × {newDims.height}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">像素变化</span>
                  <span className={`info-value ${sizeRatio < 1 ? 'success' : sizeRatio > 1 ? 'danger' : ''}`}>
                    {sizeRatio < 1 ? '-' : sizeRatio > 1 ? '+' : ''}{Math.round(Math.abs(1 - sizeRatio) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="preview-panel">
          <div
            className={`preview-area ${isDragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />

            {isDragging && (
              <div className="drag-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17,8 12,3 7,8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span>释放以上传图片</span>
              </div>
            )}

            {previewUrl ? (
              <div className="preview-container">
                <img src={previewUrl} alt="Preview" className="preview-image" />
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                </div>
                <p>点击或拖拽图片到此处上传</p>
                <span>支持 JPG、PNG、WebP、GIF、BMP 格式</span>
              </div>
            )}
          </div>

          {previewUrl && (
            <div className="download-section">
              <button className="download-btn" onClick={handleDownload}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                下载调整后的图片
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageResizer