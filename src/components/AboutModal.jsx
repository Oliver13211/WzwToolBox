import './AboutModal.css'

function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="about-modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <button className="about-modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        
        <div className="about-modal-content">
          <div className="about-logo">
            <svg viewBox="0 0 64 64" width="64" height="64">
              <path fill="currentColor" d="M58.5 14.5c-1.5-1.5-4-1.5-5.5 0L42.5 25l-3.5-3.5 10.5-10.5c1.5-1.5 1.5-4 0-5.5-3-3-7.5-4.5-12-3.5-4.5 1-8 4-9.5 8.5-1.5 4.5-0.5 9 2 12.5L6.5 46.5c-3 3-3 8 0 11s8 3 11 0l20-23.5c3.5 2.5 8 3.5 12.5 2 4.5-1.5 7.5-5 8.5-9.5 1-4.5-0.5-9-3.5-12zM13 52c-1.5 1.5-4 1.5-5.5 0s-1.5-4 0-5.5 4-1.5 5.5 0 1.5 4 0 5.5z"/>
            </svg>
          </div>
          
          <h2 className="about-title">王中王工具箱</h2>
          <p className="about-version">版本 1.0.0</p>
          
          <div className="about-divider"></div>
          
          <p className="about-description">
            一款功能强大的实用工具集合，提供文本处理、图片编辑、网络诊断、加密解密等多种工具。
          </p>
          
          <div className="about-features">
            <div className="about-feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span>文本工具</span>
            </div>
            <div className="about-feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>图片工具</span>
            </div>
            <div className="about-feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>网络工具</span>
            </div>
            <div className="about-feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>加密工具</span>
            </div>
          </div>
          
          <div className="about-footer">
            <p>© 2026 王中王工具箱 版权所有</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutModal