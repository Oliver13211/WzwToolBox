import { useState } from 'react'
import TitleBar from '../TitleBar'
import ImageCompressor from '../components/ImageCompressor'
import ImageConverter from '../components/ImageConverter'
import ImageResizer from '../components/ImageResizer'
import ImageInfo from '../components/ImageInfo'
import './ImageTools.css'

function ImageTools({ onBack }) {
  const [activeTool, setActiveTool] = useState(null)

  const tools = [
    {
      id: 'compress',
      title: '图片压缩',
      description: '压缩图片文件大小，支持 JPG、PNG、WebP 格式',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      ),
    },
    {
      id: 'convert',
      title: '格式转换',
      description: '在 JPG、PNG、WebP、GIF、BMP 等格式间转换',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"/>
        </svg>
      ),
    },
    {
      id: 'resize',
      title: '尺寸调整',
      description: '调整图片尺寸，支持按比例缩放和自定义尺寸',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
        </svg>
      ),
    },
    {
      id: 'info',
      title: '图片信息',
      description: '查看图片 EXIF 信息、色彩模式、文件详情等',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      ),
    }
  ]

  const handleToolClick = (toolId) => {
    setActiveTool(activeTool === toolId ? null : toolId)
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    }
  }

  const renderTool = (toolId) => {
    switch (toolId) {
      case 'compress':
        return <ImageCompressor />
      case 'convert':
        return <ImageConverter />
      case 'resize':
        return <ImageResizer />
      case 'info':
        return <ImageInfo />
      default:
        return (
          <div className="workspace-placeholder">
            <div className="placeholder-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <p>工具开发中...</p>
            <span>即将推出</span>
          </div>
        )
    }
  }

  return (
    <div className="image-tools-page">
      <TitleBar />
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>
      
      <header className="page-header">
        <button className="back-btn" onClick={handleBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>返回</span>
        </button>
        <div className="header-info">
          <div className="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>图片工具</h1>
            <p>Image Tools</p>
          </div>
        </div>
        <div className="header-line"></div>
      </header>

      <main className="tools-main">
        <div className="tools-container">
          <div className="tools-sidebar">
            <div className="sidebar-title">
              <span className="sidebar-icon">◈</span>
              工具列表
            </div>
            <div className="tool-nav">
              {tools.map((tool, index) => (
                <button
                  key={tool.id}
                  className={`tool-nav-item ${activeTool === tool.id ? 'active' : ''}`}
                  onClick={() => handleToolClick(tool.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="nav-icon">{tool.icon}</div>
                  <span className="nav-title">{tool.title}</span>
                  <div className="nav-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="tools-content">
            {activeTool ? (
              <div className="tool-detail">
                {tools.filter(t => t.id === activeTool).map(tool => (
                  <div key={tool.id} className="detail-card">
                    <div className="detail-header">
                      <div className="detail-icon">{tool.icon}</div>
                      <div className="detail-info">
                        <h2>{tool.title}</h2>
                        <p>{tool.description}</p>
                      </div>
                    </div>
                    <div className="tool-workspace">
                      {renderTool(tool.id)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01"/>
                  </svg>
                </div>
                <h3>选择一个工具开始</h3>
                <p>从左侧列表中选择您需要使用的图片工具</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ImageTools
