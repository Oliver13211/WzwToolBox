import { useState } from 'react'
import TitleBar from '../TitleBar'
import TextFormatter from '../components/TextFormatter'
import RegexTester from '../components/RegexTester'
import EncodingConverter from '../components/EncodingConverter'
import './TextTools.css'

function TextTools({ onBack }) {
  const [activeTool, setActiveTool] = useState(null)

  const tools = [
    {
      id: 'format',
      title: '文本格式化',
      description: 'JSON、XML、HTML、CSS、JavaScript 等代码格式化',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'regex',
      title: '正则表达式测试',
      description: '实时测试正则表达式匹配结果，支持多种模式',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'encode',
      title: '编码转换',
      description: 'Base64、URL、Unicode 等多种编码格式转换',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/>
          <polyline points="10,9 12,7 14,9"/>
          <line x1="12" y1="7" x2="12" y2="15"/>
          <polyline points="10,15 12,17 14,15"/>
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
      case 'format':
        return <TextFormatter />
      case 'regex':
        return <RegexTester />
      case 'encode':
        return <EncodingConverter />
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
    <div className="text-tools-page">
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
              <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>文本工具</h1>
            <p>Text Tools</p>
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
                <p>从左侧列表中选择您需要使用的文本工具</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default TextTools
