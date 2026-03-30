import { useState, useCallback, useRef } from 'react'
import './ImageConverter.css'

function ImageConverter() {
  const [image, setImage] = useState(null)
  const [convertedImage, setConvertedImage] = useState(null)
  const [sourceFormat, setSourceFormat] = useState('')
  const [targetFormat, setTargetFormat] = useState('jpeg')
  const [isDragging, setIsDragging] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const fileInputRef = useRef(null)

  const formatOptions = [
    { id: 'jpeg', name: 'JPG', desc: 'JPEG 格式，适合照片' },
    { id: 'png', name: 'PNG', desc: 'PNG 格式，支持透明' },
    { id: 'webp', name: 'WebP', desc: 'WebP 格式，更小体积' },
    { id: 'gif', name: 'GIF', desc: 'GIF 格式，支持动画' },
    { id: 'bmp', name: 'BMP', desc: 'BMP 格式，无压缩' }
  ]

  const handleFileSelect = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return

    const format = file.type.split('/')[1]?.toLowerCase() || 'unknown'
    setSourceFormat(format)

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
          size: file.size,
          format: format
        })
        setConvertedImage(null)
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

  const convertImage = useCallback(() => {
    if (!image) return

    setIsConverting(true)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')

      if (targetFormat === 'jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)

      const outputFormat = `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const convertedUrl = URL.createObjectURL(blob)
            const originalExt = image.name.split('.').pop()
            const newName = image.name.replace(/\.[^.]+$/, `.${targetFormat}`)

            setConvertedImage({
              url: convertedUrl,
              size: blob.size,
              name: newName,
              format: targetFormat
            })
          }
          setIsConverting(false)
        },
        outputFormat,
        0.92
      )
    }
    img.src = image.url
  }, [image, targetFormat])

  const handleDownload = () => {
    if (!convertedImage) return

    const link = document.createElement('a')
    link.href = convertedImage.url
    link.download = convertedImage.name
    link.click()
  }

  const handleClear = () => {
    if (convertedImage?.url) {
      URL.revokeObjectURL(convertedImage.url)
    }
    if (image?.url) {
      URL.revokeObjectURL(image.url)
    }
    setImage(null)
    setConvertedImage(null)
    setSourceFormat('')
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getSizeChange = () => {
    if (!image || !convertedImage) return null
    const diff = convertedImage.size - image.size
    const percent = ((diff / image.size) * 100).toFixed(1)
    return { diff, percent }
  }

  return (
    <div className="image-converter">
      <div className="converter-toolbar">
        <div className="toolbar-section">
          <span className="toolbar-label">原格式:</span>
          <span className="format-badge">{sourceFormat.toUpperCase() || '-'}</span>
        </div>

        <div className="toolbar-section">
          <span className="toolbar-label">转换至:</span>
          <div className="format-buttons">
            {formatOptions.map(opt => (
              <button
                key={opt.id}
                className={`format-btn ${targetFormat === opt.id ? 'active' : ''}`}
                onClick={() => setTargetFormat(opt.id)}
                title={opt.desc}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-actions">
          <button
            className="action-btn primary"
            onClick={convertImage}
            disabled={!image || isConverting}
          >
            {isConverting ? (
              <>
                <span className="spinner"></span>
                转换中...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"/>
                </svg>
                转换
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

      <div className="converter-main">
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
              <span>支持 JPG、PNG、WebP、GIF、BMP 格式</span>
            </div>
          ) : (
            <div className="preview-container">
              <img src={image.url} alt="原始图片" className="preview-image" />
              <div className="image-info">
                <span className="image-name">{image.name}</span>
                <span className="image-format">{image.format?.toUpperCase() || '-'}</span>
                <span className="image-size">{formatSize(image.size)}</span>
                <span className="image-dims">{image.width} × {image.height}</span>
              </div>
            </div>
          )}
        </div>

        <div className="arrow-indicator">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{targetFormat.toUpperCase()}</span>
        </div>

        <div className="result-area">
          {convertedImage ? (
            <div className="result-preview">
              <img src={convertedImage.url} alt="转换结果" className="preview-image" />
              <div className="result-info">
                <div className="result-stats">
                  <div className="stat-item">
                    <span className="stat-label">原始大小</span>
                    <span className="stat-value">{formatSize(image.size)}</span>
                  </div>
                  <div className="stat-item highlight">
                    <span className="stat-label">转换后</span>
                    <span className="stat-value">{formatSize(convertedImage.size)}</span>
                  </div>
                  {getSizeChange() && (
                    <div className="stat-item">
                      <span className="stat-label">{getSizeChange().diff > 0 ? '增大' : '减小'}</span>
                      <span className={`stat-value ${getSizeChange().diff > 0 ? 'danger' : 'success'}`}>
                        {Math.abs(getSizeChange().diff)} ({getSizeChange().percent}%)
                      </span>
                    </div>
                  )}
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
              <p>转换结果预览</p>
              <span>上传图片并选择目标格式后开始转换</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageConverter
