import { useState } from 'react'
import TitleBar from './TitleBar'
import TextTools from './pages/TextTools'
import ImageTools from './pages/ImageTools'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const features = [
    {
      id: 1,
      title: '文本工具',
      description: '文本格式化、正则表达式测试、编码转换等',
      page: 'text-tools',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: 2,
      title: '图片工具',
      description: '图片压缩、格式转换等',
      page: 'image-tools',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      )
    },
    {
      id: 3,
      title: '网络工具',
      description: 'IP查询、端口扫描、DNS测试等',
      page: 'network-tools',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )
    },
    {
      id: 4,
      title: '系统工具',
      description: '文件管理、进程管理、系统信息等',
      page: 'system-tools',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
          <path d="M9 9h6v6H9z"/>
        </svg>
      )
    },
    {
      id: 5,
      title: '开发工具',
      description: '代码格式化、JSON验证、API测试等',
      page: 'dev-tools',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 6,
      title: '加密工具',
      description: 'MD5生成、Base64编码、AES加密等',
      page: 'crypto-tools',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      )
    }
  ]

  const handleCardClick = (page) => {
    setCurrentPage(page)
  }

  const handleBackToHome = () => {
    setCurrentPage('home')
  }

  if (currentPage === 'text-tools') {
    return <TextTools onBack={handleBackToHome} />
  }

  if (currentPage === 'image-tools') {
    return <ImageTools onBack={handleBackToHome} />
  }

  return (
    <div className="app">
      <TitleBar />
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>
      
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo-ring"></div>
            <svg className="logo-icon" viewBox="0 0 64 64" width="48" height="48">
              <path fill="currentColor" d="M58.5 14.5c-1.5-1.5-4-1.5-5.5 0L42.5 25l-3.5-3.5 10.5-10.5c1.5-1.5 1.5-4 0-5.5-3-3-7.5-4.5-12-3.5-4.5 1-8 4-9.5 8.5-1.5 4.5-0.5 9 2 12.5L6.5 46.5c-3 3-3 8 0 11s8 3 11 0l20-23.5c3.5 2.5 8 3.5 12.5 2 4.5-1.5 7.5-5 8.5-9.5 1-4.5-0.5-9-3.5-12zM13 52c-1.5 1.5-4 1.5-5.5 0s-1.5-4 0-5.5 4-1.5 5.5 0 1.5 4 0 5.5z"/>
            </svg>
          </div>
          <h1>王中王工具箱</h1>
          <p className="subtitle">WzwToolBox - 一站式实用工具集合</p>
          <div className="header-line"></div>
        </div>
      </header>
      
      <main className="main">
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div 
              key={feature.id} 
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleCardClick(feature.page)}
            >
              <div className="card-glow"></div>
              <div className="card-border"></div>
              <div className="card-content">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="card-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <footer className="footer">
        <div className="footer-content">
          <span className="footer-text">© 2026 王中王工具箱</span>
          <span className="footer-divider">|</span>
          <span className="footer-text">WzwToolBox</span>
        </div>
      </footer>
    </div>
  )
}

export default App
