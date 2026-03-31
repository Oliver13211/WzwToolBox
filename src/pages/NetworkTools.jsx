import { useState } from 'react'
import TitleBar from '../TitleBar'
import IPQuery from '../components/IPQuery'
import PortScan from '../components/PortScan'
import './NetworkTools.css'

function NetworkTools({ onBack }) {
  const [activeTool, setActiveTool] = useState(null)

  const tools = [
    {
      id: 'ip-query',
      title: 'IP 查询',
      description: '查询 IP 地址的地理位置和归属地信息',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
    },
    {
      id: 'port-scan',
      title: '端口扫描',
      description: '扫描目标主机的常用端口开放情况',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ),
    },
    {
      id: 'dns-test',
      title: 'DNS 测试',
      description: '测试域名的 DNS 解析记录',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
        </svg>
      ),
    },
    {
      id: 'ping',
      title: 'Ping 测试',
      description: '测试主机的连通性和响应延迟',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      ),
    },
    {
      id: 'whois',
      title: 'Whois 查询',
      description: '查询域名的注册信息和所有者',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
        </svg>
      ),
    },
    {
      id: 'http-check',
      title: 'HTTP 检查',
      description: '检查网站的 HTTP/HTTPS 状态和响应头',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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
      case 'ip-query':
        return <IPQuery />
      case 'port-scan':
        return <PortScan />
      default:
        return (
          <div className="workspace-placeholder">
            <div className="placeholder-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
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
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>网络工具</h1>
            <p>Network Tools</p>
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
                <p>从左侧列表中选择您需要使用的网络工具</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default NetworkTools