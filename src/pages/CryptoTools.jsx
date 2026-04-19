import { useState } from 'react'
import TitleBar from '../TitleBar'
import HashGenerator from '../components/HashGenerator'
import './CryptoTools.css'

function CryptoTools({ onBack }) {
  const [activeTool, setActiveTool] = useState(null)

  const tools = [
    {
      id: 'hash',
      title: '哈希生成',
      description: 'MD5、SHA1、SHA256 等常见哈希算法生成',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
    },
    {
      id: 'base64',
      title: 'Base64 编解码',
      description: 'Base64 字符串编码和解码',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2"/>
          <polyline points="10,9 12,7 14,9"/>
          <line x1="12" y1="7" x2="12" y2="15"/>
          <polyline points="10,15 12,17 14,15"/>
        </svg>
      ),
    },
    {
      id: 'url-encode',
      title: 'URL 编解码',
      description: 'URL 字符串编码和解码',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
      ),
    },
    {
      id: 'uuid',
      title: 'UUID 生成',
      description: '生成 UUID / GUID 唯一标识符',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    },
    {
      id: 'qrcode',
      title: '二维码生成',
      description: '将文本或 URL 生成二维码图片',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <rect x="14" y="14" width="3" height="3"/>
          <rect x="18" y="14" width="3" height="3"/>
          <rect x="14" y="18" width="3" height="3"/>
          <rect x="18" y="18" width="3" height="3"/>
        </svg>
      ),
    },
    {
      id: 'jwt',
      title: 'JWT 解析',
      description: '解码和验证 JWT Token',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
        </svg>
      ),
    },
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
      case 'hash':
        return <HashGenerator />
      case 'base64':
        return <Base64Codec />
      case 'url-encode':
        return <UrlEncoder />
      case 'uuid':
        return <UuidGenerator />
      case 'qrcode':
        return <QrCodeGenerator />
      case 'jwt':
        return <JwtDecoder />
      default:
        return (
          <div className="workspace-placeholder">
            <div className="placeholder-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <p>工具开发中...</p>
            <span>即将推出</span>
          </div>
        )
    }
  }

  return (
    <div className="network-tools-page">
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
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>加密工具</h1>
            <p>Crypto Tools</p>
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
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h3>选择一个工具开始</h3>
                <p>从左侧列表中选择您需要使用的加密工具</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Base64Codec() {
  return (
    <div className="workspace-placeholder">
      <div className="placeholder-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <p>Base64 编解码工具开发中...</p>
      <span>即将推出</span>
    </div>
  )
}

function UrlEncoder() {
  return (
    <div className="workspace-placeholder">
      <div className="placeholder-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <p>URL 编解码工具开发中...</p>
      <span>即将推出</span>
    </div>
  )
}

function UuidGenerator() {
  return (
    <div className="workspace-placeholder">
      <div className="placeholder-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <p>UUID 生成工具开发中...</p>
      <span>即将推出</span>
    </div>
  )
}

function QrCodeGenerator() {
  return (
    <div className="workspace-placeholder">
      <div className="placeholder-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <p>二维码生成工具开发中...</p>
      <span>即将推出</span>
    </div>
  )
}

function JwtDecoder() {
  return (
    <div className="workspace-placeholder">
      <div className="placeholder-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <p>JWT 解析工具开发中...</p>
      <span>即将推出</span>
    </div>
  )
}

export default CryptoTools
