import { useState, useCallback } from 'react'
import './EncodingConverter.css'

function EncodingConverter() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [activeMode, setActiveMode] = useState('base64-encode')
  const [error, setError] = useState('')

  const modes = [
    { id: 'base64-encode', name: 'Base64 编码', category: 'Base64' },
    { id: 'base64-decode', name: 'Base64 解码', category: 'Base64' },
    { id: 'url-encode', name: 'URL 编码', category: 'URL' },
    { id: 'url-decode', name: 'URL 解码', category: 'URL' },
    { id: 'unicode-encode', name: 'Unicode 编码', category: 'Unicode' },
    { id: 'unicode-decode', name: 'Unicode 解码', category: 'Unicode' },
    { id: 'html-encode', name: 'HTML 实体编码', category: 'HTML' },
    { id: 'html-decode', name: 'HTML 实体解码', category: 'HTML' },
    { id: 'md5', name: 'MD5 哈希', category: '哈希' },
    { id: 'sha1', name: 'SHA1 哈希', category: '哈希' },
    { id: 'sha256', name: 'SHA256 哈希', category: '哈希' },
    { id: 'hex-encode', name: 'Hex 编码', category: 'Hex' },
    { id: 'hex-decode', name: 'Hex 解码', category: 'Hex' }
  ]

  const categories = [...new Set(modes.map(m => m.category))]

  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }

  const encodeHtml = (str) => {
    return String(str).replace(/[&<>"'`=/]/g, s => htmlEntities[s])
  }

  const decodeHtml = (str) => {
    return String(str)
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#x60;/g, '`')
      .replace(/&#x3D;/g, '=')
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
      .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
  }

  const unicodeEncode = (str) => {
    return str.split('').map(char => {
      const code = char.charCodeAt(0)
      if (code > 127) {
        return '\\u' + code.toString(16).padStart(4, '0')
      }
      return char
    }).join('')
  }

  const unicodeDecode = (str) => {
    return str.replace(/\\u([0-9A-Fa-f]{4})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16))
    })
  }

  const hexEncode = (str) => {
    return Array.from(str)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(' ')
  }

  const hexDecode = (str) => {
    try {
      const hex = str.replace(/\s/g, '')
      let result = ''
      for (let i = 0; i < hex.length; i += 2) {
        result += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
      }
      return result
    } catch (e) {
      throw new Error('Hex 解码失败: 无效的十六进制字符串')
    }
  }

  const hashText = async (text, algorithm) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest(algorithm, data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const convert = useCallback(async (text, mode) => {
    if (!text) {
      setOutputText('')
      setError('')
      return
    }

    try {
      setError('')
      let result = ''

      switch (mode) {
        case 'base64-encode':
          result = btoa(unescape(encodeURIComponent(text)))
          break
        case 'base64-decode':
          result = decodeURIComponent(escape(atob(text)))
          break
        case 'url-encode':
          result = encodeURIComponent(text)
          break
        case 'url-decode':
          result = decodeURIComponent(text)
          break
        case 'unicode-encode':
          result = unicodeEncode(text)
          break
        case 'unicode-decode':
          result = unicodeDecode(text)
          break
        case 'html-encode':
          result = encodeHtml(text)
          break
        case 'html-decode':
          result = decodeHtml(text)
          break
        case 'md5':
          result = await hashText(text, 'MD5')
          break
        case 'sha1':
          result = await hashText(text, 'SHA-1')
          break
        case 'sha256':
          result = await hashText(text, 'SHA-256')
          break
        case 'hex-encode':
          result = hexEncode(text)
          break
        case 'hex-decode':
          result = hexDecode(text)
          break
        default:
          result = text
      }

      setOutputText(result)
    } catch (e) {
      setError('转换失败: ' + e.message)
      setOutputText('')
    }
  }, [])

  const handleInputChange = (e) => {
    const text = e.target.value
    setInputText(text)
    convert(text, activeMode)
  }

  const handleModeChange = (mode) => {
    setActiveMode(mode)
    convert(inputText, mode)
  }

  const handleSwap = () => {
    setInputText(outputText)
    setOutputText(inputText)
  }

  const handleCopy = async () => {
    if (outputText) {
      try {
        await navigator.clipboard.writeText(outputText)
      } catch (e) {
        console.error('复制失败:', e)
      }
    }
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    setError('')
  }

  return (
    <div className="encoding-converter">
      <div className="converter-header">
        <div className="mode-categories">
          {categories.map(category => (
            <div key={category} className="category-group">
              <div className="category-title">{category}</div>
              <div className="category-modes">
                {modes.filter(m => m.category === category).map(mode => (
                  <button
                    key={mode.id}
                    className={`mode-btn ${activeMode === mode.id ? 'active' : ''}`}
                    onClick={() => handleModeChange(mode.id)}
                  >
                    {mode.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="converter-body">
        <div className="panel input-panel">
          <div className="panel-header">
            <span className="panel-title">输入</span>
            <span className="char-count">{inputText.length} 字符</span>
          </div>
          <textarea
            className="panel-textarea"
            value={inputText}
            onChange={handleInputChange}
            placeholder="输入需要转换的文本..."
            spellCheck={false}
          />
        </div>

        <div className="panel-actions">
          <button className="action-btn swap-btn" onClick={handleSwap} title="交换">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="action-btn clear-btn" onClick={handleClear} title="清空">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="panel output-panel">
          <div className="panel-header">
            <span className="panel-title">输出</span>
            <div className="output-actions">
              <span className="char-count">{outputText.length} 字符</span>
              <button className="copy-btn" onClick={handleCopy} title="复制">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </button>
            </div>
          </div>
          <textarea
            className="panel-textarea"
            value={outputText}
            readOnly
            placeholder="转换结果将显示在这里..."
            spellCheck={false}
          />
        </div>
      </div>

      {error && (
        <div className="error-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default EncodingConverter
