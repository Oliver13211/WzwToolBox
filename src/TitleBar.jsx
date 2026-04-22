import { useState, useEffect } from 'react'
import './TitleBar.css'

function TitleBar({ onAboutClick }) {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.electronAPI.isMaximized().then(setIsMaximized)

    const handleMaximized = () => setIsMaximized(true)
    const handleUnmaximized = () => setIsMaximized(false)

    window.electronAPI.onWindowMaximized(handleMaximized)
    window.electronAPI.onWindowUnmaximized(handleUnmaximized)
  }, [])

  const handleMinimize = () => {
    window.electronAPI.minimizeWindow()
  }

  const handleMaximize = () => {
    window.electronAPI.maximizeWindow()
  }

  const handleClose = () => {
    window.electronAPI.closeWindow()
  }

  return (
    <div className="title-bar">
      <div className="title-bar-drag">
        <span className="title-bar-icon">
          <svg viewBox="0 0 64 64" width="18" height="18">
            <path fill="currentColor" d="M58.5 14.5c-1.5-1.5-4-1.5-5.5 0L42.5 25l-3.5-3.5 10.5-10.5c1.5-1.5 1.5-4 0-5.5-3-3-7.5-4.5-12-3.5-4.5 1-8 4-9.5 8.5-1.5 4.5-0.5 9 2 12.5L6.5 46.5c-3 3-3 8 0 11s8 3 11 0l20-23.5c3.5 2.5 8 3.5 12.5 2 4.5-1.5 7.5-5 8.5-9.5 1-4.5-0.5-9-3.5-12zM13 52c-1.5 1.5-4 1.5-5.5 0s-1.5-4 0-5.5 4-1.5 5.5 0 1.5 4 0 5.5z"/>
          </svg>
        </span>
        <span className="title-bar-title">王中王工具箱</span>
      </div>
      <div className="title-bar-controls">
        <button className="title-bar-btn about" onClick={onAboutClick} title="关于">
          <svg viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <line x1="6" y1="5" x2="6" y2="5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="6" y1="7" x2="6" y2="9" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        <button className="title-bar-btn minimize" onClick={handleMinimize} title="最小化">
          <svg viewBox="0 0 12 12">
            <rect y="5" width="12" height="2" fill="currentColor" />
          </svg>
        </button>
        <button className="title-bar-btn maximize" onClick={handleMaximize} title={isMaximized ? '还原' : '最大化'}>
          {isMaximized ? (
            <svg viewBox="0 0 12 12" className="restore-icon">
              <rect x="2" y="0" width="8" height="8" strokeWidth="1.2" fill="none" stroke="currentColor" />
              <rect x="0" y="2" width="8" height="8" strokeWidth="1.2" fill="none" stroke="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 12">
              <rect x="1" y="1" width="10" height="10" strokeWidth="1.2" fill="none" stroke="currentColor" />
            </svg>
          )}
        </button>
        <button className="title-bar-btn close" onClick={handleClose} title="关闭">
          <svg viewBox="0 0 12 12">
            <path d="M1,1 L11,11 M11,1 L1,11" strokeWidth="2" stroke="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TitleBar
