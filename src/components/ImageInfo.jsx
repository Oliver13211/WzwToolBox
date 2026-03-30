import { useState, useCallback, useRef } from 'react'
import './ImageInfo.css'

function ImageInfo() {
  const [image, setImage] = useState(null)
  const [imageData, setImageData] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const fileInputRef = useRef(null)

  const extractImageData = useCallback((file, dataUrl) => {
    setIsLoading(true)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const imageInfo = {
        name: file.name,
        type: file.type,
        size: file.size,
        width: img.width,
        height: img.height,
        aspectRatio: (img.width / img.height).toFixed(2),
        orientation: getOrientation(img.width, img.height),
        bitDepth: estimateBitDepth(ctx, file.type),
        colorMode: getColorMode(ctx),
        hasAlpha: file.type.includes('png') || file.type.includes('webp'),
        megapixels: ((img.width * img.height) / 1000000).toFixed(2) + ' MP',
        dataUrl: dataUrl
      }

      setImage({
        url: dataUrl,
        name: file.name,
        type: file.type,
        size: file.size
      })
      setImageData(imageInfo)
      setIsLoading(false)
      img.src = ''
    }
    img.onerror = () => {
      setIsLoading(false)
    }
    img.src = dataUrl
  }, [])

  const getOrientation = (width, height) => {
    const ratio = width / height
    if (ratio > 1.5) return '横向 (Landscape)'
    if (ratio < 0.67) return '竖向 (Portrait)'
    return '方形 (Square)'
  }

  const getColorMode = (ctx) => {
    const imageData = ctx.getImageData(0, 0, 1, 1)
    const data = imageData.data
    if (data[3] < 255) return 'RGBA (带透明)'
    return 'RGB'
  }

  const estimateBitDepth = (ctx, mimeType) => {
    if (mimeType === 'image/png') return '8-bit (PNG)'
    if (mimeType === 'image/jpeg') return '8-bit (JPEG)'
    if (mimeType === 'image/webp') return '8-bit (WebP)'
    if (mimeType === 'image/gif') return '8-bit (GIF)'
    return '8-bit'
  }

  const handleFileSelect = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      extractImageData(file, e.target.result)
    }
    reader.readAsDataURL(file)
  }, [extractImageData])

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

  const handleInputChange = useCallback((e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  }, [handleFileSelect])

  const handleClear = useCallback(() => {
    setImage(null)
    setImageData(null)
    setActiveTab('basic')
  }, [])

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const formatSizeVerbose = (bytes) => {
    if (bytes < 1024) return bytes + ' 字节'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' 千字节'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' 兆字节'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' 吉字节'
  }

  return (
    <div className="image-info-tool">
      <div className="info-toolbar">
        <div className="toolbar-section">
          <span className="toolbar-label">标签:</span>
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              基本信息
            </button>
            <button
              className={`tab-btn ${activeTab === 'detail' ? 'active' : ''}`}
              onClick={() => setActiveTab('detail')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              </svg>
              详细信息
            </button>
          </div>
        </div>

        <div className="toolbar-actions">
          <button className="action-btn" onClick={handleClear} disabled={!image}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
            清空
          </button>
        </div>
      </div>

      <div className="info-main">
        <div className="preview-panel">
          <div
            className={`preview-area ${isDragging ? 'dragging' : ''} ${!image ? 'empty' : ''}`}
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
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17,8 12,3 7,8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span>释放以上传图片</span>
              </div>
            )}

            {isLoading && (
              <div className="loading-overlay">
                <span className="spinner"></span>
                <span>分析中...</span>
              </div>
            )}

            {image ? (
              <div className="preview-container">
                <img src={image.url} alt="Preview" className="preview-image" />
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
                <p>点击或拖拽图片到此处</p>
                <span>上传图片以查看详细信息</span>
              </div>
            )}
          </div>
        </div>

        <div className="details-panel">
          {imageData ? (
            <>
              {activeTab === 'basic' && (
                <div className="info-section">
                  <h3>基本信息</h3>
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="info-label">文件名</span>
                      <span className="info-value">{imageData.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">文件格式</span>
                      <span className="info-value badge">{imageData.type.toUpperCase().split('/')[1]}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">文件大小</span>
                      <span className="info-value">{formatSize(imageData.size)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">尺寸</span>
                      <span className="info-value highlight">{imageData.width} × {imageData.height} px</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">像素</span>
                      <span className="info-value">{imageData.megapixels}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">方向</span>
                      <span className="info-value">{imageData.orientation}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'detail' && (
                <div className="info-section">
                  <h3>详细信息</h3>
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="info-label">宽高比</span>
                      <span className="info-value">{imageData.aspectRatio}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">色深</span>
                      <span className="info-value">{imageData.bitDepth}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">色彩模式</span>
                      <span className="info-value">{imageData.colorMode}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">透明度</span>
                      <span className="info-value">{imageData.hasAlpha ? '支持' : '不支持'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">MIME类型</span>
                      <span className="info-value mono">{imageData.type}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">精确大小</span>
                      <span className="info-value mono">{formatSizeVerbose(imageData.size)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-details">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              <p>暂无图片信息</p>
              <span>请上传一张图片</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageInfo