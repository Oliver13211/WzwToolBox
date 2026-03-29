import { useState, useCallback, useRef } from 'react'
import './ImageCompressor.css'

function ImageCompressor() {
  const [image, setImage] = useState(null)
  const [compressedImage, setCompressedImage] = useState(null)
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState('jpeg')
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const fileInputRef = useRef(null)

  const formatOptions = [
    { id: 'jpeg', name: 'JPG', desc: 'JPEG 格式，适合照片' },
    { id: 'png', name: 'PNG', desc: 'PNG 格式，适合图标' },
    { id: 'webp', name: 'WebP', desc: 'WebP 格式，更小体积' }
  ]

  const handleFileSelect = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setImage({
          file,
          url: e.target.result,
          width: img.width,
          height: img.height,
          name: file.name,
          size: file.size
        })
        setCompressedImage(null)
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

  const compressImage = useCallback(() => {
    if (!image) return

    setIsCompressing(true)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const outputFormat = format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp'
      const qualityValue = format === 'png' ? 1 : quality / 100

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedUrl = URL.createObjectURL(blob)
            setCompressedImage({
              url: compressedUrl,
              size: blob.size,
              name: image.name.replace(/\.[^.]+$/, `.${format}`)
            })
          }
          setIsCompressing(false)
        },
        outputFormat,
        qualityValue
      )
    }
    img.src = image.url
  }, [image, quality, format])

  const handleDownload = () => {
    if (!compressedImage) return

    const link = document.createElement('a')
    link.href = compressedImage.url
    link.download = compressedImage.name
    link.click()
  }

  const handleClear = () => {
    if (compressedImage?.url) {
      URL.revokeObjectURL(compressedImage.url)
    }
    if (image?.url) {
      URL.revokeObjectURL(image.url)
    }
    setImage(null)
    setCompressedImage(null)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getCompressionRatio = () => {
    if (!image || !compressedImage) return 0
    return ((1 - compressedImage.size / image.size) * 100).toFixed(1)
  }

  const getRatioClass = () => {
    const ratio = parseFloat(getCompressionRatio())
    if (ratio > 0) return 'success'
    if (ratio < 0) return 'danger'
    return 'neutral'
  }

  return (
    <div className="image-compressor">
      <div className="compressor-toolbar">
        <div className="toolbar-section">
          <span className="toolbar-label">格式:</span>
          <div className="format-buttons">
            {formatOptions.map(opt => (
              <button
                key={opt.id}
                className={`format-btn ${format === opt.id ? 'active' : ''}`}
                onClick={() => setFormat(opt.id)}
                title={opt.desc}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>

        {format !== 'png' && (
          <div className="toolbar-section">
            <span className="toolbar-label">质量:</span>
            <div className="quality-control">
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="quality-slider"
              />
              <span className="quality-value">{quality}%</span>
            </div>
          </div>
        )}

        <div className="toolbar-actions">
          <button
            className="action-btn primary"
            onClick={compressImage}
            disabled={!image || isCompressing}
          >
            {isCompressing ? (
              <>
                <span className="spinner"></span>
                压缩中...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                压缩
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

      <div className="compressor-main">
        <div className="upload-area"
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

          {!image ? (
            <div className="upload-placeholder">
              <div className="upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
              <p>点击或拖拽图片到此处上传</p>
              <span>支持 JPG、PNG、WebP 格式</span>
            </div>
          ) : (
            <div className="preview-container">
              <img src={image.url} alt="原始图片" className="preview-image" />
              <div className="image-info">
                <span className="image-name">{image.name}</span>
                <span className="image-size">{formatSize(image.size)}</span>
                <span className="image-dims">{image.width} × {image.height}</span>
              </div>
            </div>
          )}
        </div>

        <div className="result-area">
          {compressedImage ? (
            <div className="result-preview">
              <img src={compressedImage.url} alt="压缩结果" className="preview-image" />
              <div className="result-info">
                <div className="result-stats">
                  <div className="stat-item">
                    <span className="stat-label">原始大小</span>
                    <span className="stat-value">{formatSize(image.size)}</span>
                  </div>
                  <div className="stat-item highlight">
                    <span className="stat-label">压缩后</span>
                    <span className="stat-value">{formatSize(compressedImage.size)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">节省</span>
                    <span className={`stat-value ${getRatioClass()}`}>{getCompressionRatio()}%</span>
                  </div>
                </div>
                <button className="download-btn" onClick={handleDownload}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  下载图片
                </button>
              </div>
            </div>
          ) : (
            <div className="result-placeholder">
              <div className="placeholder-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
              <p>压缩结果预览</p>
              <span>上传图片并设置参数后开始压缩</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageCompressor
