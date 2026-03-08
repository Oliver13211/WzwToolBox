import { useState, useCallback } from 'react'
import './TextFormatter.css'

function TextFormatter() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [formatType, setFormatType] = useState('json')
  const [error, setError] = useState('')
  const [mode, setMode] = useState('format')

  const formatJSON = (text, compress = false) => {
    try {
      const parsed = JSON.parse(text)
      if (compress) {
        return JSON.stringify(parsed)
      }
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      throw new Error('JSON 格式错误: ' + e.message)
    }
  }

  const formatXML = (text, compress = false) => {
    try {
      let xml = text.trim()
      if (compress) {
        xml = xml.replace(/>\s*</g, '><')
        xml = xml.replace(/\s+/g, ' ')
        return xml.trim()
      }
      
      let formatted = ''
      let indent = ''
      const indentStr = '  '
      xml = xml.replace(/>\s*</g, '><')
      xml.split(/(<[^>]+>)/g).forEach(node => {
        if (!node.trim()) return
        
        if (node.match(/^<\/\w/)) {
          indent = indent.slice(0, -indentStr.length)
        }
        
        if (node.match(/^<\w[^>]*[^/]>$/)) {
          formatted += indent + node + '\n'
          indent += indentStr
        } else if (node.match(/^<\/\w/)) {
          formatted += indent + node + '\n'
        } else if (node.match(/^<\w[^>]*\/>$/)) {
          formatted += indent + node + '\n'
        } else if (node.match(/^<\?/)) {
          formatted += indent + node + '\n'
        } else if (node.match(/^<!\[CDATA\[/)) {
          formatted += indent + node + '\n'
        } else if (node.match(/^<!/)) {
          formatted += indent + node + '\n'
        } else {
          formatted += indent + node + '\n'
        }
      })
      
      return formatted.trim()
    } catch (e) {
      throw new Error('XML 格式错误: ' + e.message)
    }
  }

  const formatHTML = (text, compress = false) => {
    try {
      let html = text.trim()
      
      if (compress) {
        html = html.replace(/>\s+</g, '><')
        html = html.replace(/\s+/g, ' ')
        return html.trim()
      }
      
      let formatted = ''
      let indent = ''
      const indentStr = '  '
      const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr']
      
      html = html.replace(/>\s+</g, '><')
      
      const tokens = html.split(/(<[^>]+>)/g)
      
      tokens.forEach(token => {
        if (!token.trim()) return
        
        const tagMatch = token.match(/^<\/?(\w+)/)
        const tagName = tagMatch ? tagMatch[1].toLowerCase() : ''
        
        if (token.match(/^<\//)) {
          indent = indent.slice(0, -indentStr.length)
          formatted += indent + token + '\n'
        } else if (token.match(/^<\w/)) {
          formatted += indent + token + '\n'
          if (!token.match(/\/>$/) && !selfClosingTags.includes(tagName)) {
            indent += indentStr
          }
        } else if (token.match(/^<\?/)) {
          formatted += indent + token + '\n'
        } else if (token.match(/^<!/)) {
          formatted += indent + token + '\n'
        } else {
          formatted += indent + token + '\n'
        }
      })
      
      return formatted.trim()
    } catch (e) {
      throw new Error('HTML 格式错误: ' + e.message)
    }
  }

  const formatCSS = (text, compress = false) => {
    try {
      let css = text.trim()
      
      if (compress) {
        css = css.replace(/\/\*[\s\S]*?\*\//g, '')
        css = css.replace(/\s+/g, ' ')
        css = css.replace(/\s*([{};:,>+~])\s*/g, '$1')
        css = css.replace(/;}/g, '}')
        css = css.replace(/\s+/g, ' ')
        return css.trim()
      }
      
      let formatted = ''
      let indent = ''
      const indentStr = '  '
      
      css = css.replace(/\/\*[\s\S]*?\*\//g, '')
      css = css.replace(/\s+/g, ' ')
      css = css.replace(/\s*([{};:,>+~])\s*/g, '$1')
      
      for (let i = 0; i < css.length; i++) {
        const char = css[i]
        
        if (char === '{') {
          formatted += ' ' + char + '\n'
          indent += indentStr
        } else if (char === '}') {
          indent = indent.slice(0, -indentStr.length)
          formatted += indent + char + '\n'
        } else if (char === ';') {
          formatted += char + '\n'
        } else if (char === ':') {
          formatted += char + ' '
        } else {
          if (formatted.endsWith('\n')) {
            formatted += indent + char
          } else {
            formatted += char
          }
        }
      }
      
      return formatted.trim()
    } catch (e) {
      throw new Error('CSS 格式错误: ' + e.message)
    }
  }

  const formatJS = (text, compress = false) => {
    try {
      let js = text.trim()
      
      if (compress) {
        js = js.replace(/\/\*[\s\S]*?\*\//g, '')
        js = js.replace(/\/\/.*$/gm, '')
        js = js.replace(/\s+/g, ' ')
        js = js.replace(/\s*([{};:,=+\-*/<>!&|()])\s*/g, '$1')
        js = js.replace(/\s+/g, ' ')
        return js.trim()
      }
      
      let formatted = ''
      let indent = ''
      const indentStr = '  '
      
      js = js.replace(/\/\*[\s\S]*?\*\//g, '')
      js = js.replace(/\/\/.*$/gm, '')
      
      let inString = false
      let stringChar = ''
      
      for (let i = 0; i < js.length; i++) {
        const char = js[i]
        const prevChar = i > 0 ? js[i - 1] : ''
        const nextChar = i < js.length - 1 ? js[i + 1] : ''
        
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
          if (!inString) {
            inString = true
            stringChar = char
          } else if (char === stringChar) {
            inString = false
          }
        }
        
        if (!inString) {
          if (char === '{') {
            formatted += char + '\n'
            indent += indentStr
            formatted += indent
          } else if (char === '}') {
            indent = indent.slice(0, -indentStr.length)
            formatted = formatted.trimEnd() + '\n' + indent + char
            if (nextChar !== '}' && nextChar !== ';' && nextChar !== ')') {
              formatted += '\n' + indent
            }
          } else if (char === ';') {
            formatted += char + '\n' + indent
          } else {
            formatted += char
          }
        } else {
          formatted += char
        }
      }
      
      formatted = formatted.replace(/\n\s*\n/g, '\n')
      return formatted.trim()
    } catch (e) {
      throw new Error('JavaScript 格式错误: ' + e.message)
    }
  }

  const handleFormat = useCallback(() => {
    if (!inputText.trim()) {
      setError('请输入需要格式化的文本')
      setOutputText('')
      return
    }

    setError('')
    
    try {
      const compress = mode === 'compress'
      let result = ''
      
      switch (formatType) {
        case 'json':
          result = formatJSON(inputText, compress)
          break
        case 'xml':
          result = formatXML(inputText, compress)
          break
        case 'html':
          result = formatHTML(inputText, compress)
          break
        case 'css':
          result = formatCSS(inputText, compress)
          break
        case 'js':
          result = formatJS(inputText, compress)
          break
        default:
          result = inputText
      }
      
      setOutputText(result)
    } catch (e) {
      setError(e.message)
      setOutputText('')
    }
  }, [inputText, formatType, mode])

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    setError('')
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

  const handleSwap = () => {
    const temp = inputText
    setInputText(outputText)
    setOutputText(temp)
    setError('')
  }

  const formatTypes = [
    { id: 'json', label: 'JSON', icon: '{ }' },
    { id: 'xml', label: 'XML', icon: '< >' },
    { id: 'html', label: 'HTML', icon: '< >' },
    { id: 'css', label: 'CSS', icon: '# .' },
    { id: 'js', label: 'JavaScript', icon: 'JS' }
  ]

  return (
    <div className="text-formatter">
      <div className="formatter-toolbar">
        <div className="format-type-selector">
          <span className="selector-label">格式类型:</span>
          <div className="type-buttons">
            {formatTypes.map(type => (
              <button
                key={type.id}
                className={`type-btn ${formatType === type.id ? 'active' : ''}`}
                onClick={() => setFormatType(type.id)}
              >
                <span className="type-icon">{type.icon}</span>
                <span className="type-label">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mode-selector">
          <span className="selector-label">操作模式:</span>
          <div className="mode-buttons">
            <button
              className={`mode-btn ${mode === 'format' ? 'active' : ''}`}
              onClick={() => setMode('format')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round"/>
              </svg>
              格式化
            </button>
            <button
              className={`mode-btn ${mode === 'compress' ? 'active' : ''}`}
              onClick={() => setMode('compress')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h16M12 4v16" strokeLinecap="round"/>
              </svg>
              压缩
            </button>
          </div>
        </div>
      </div>

      <div className="formatter-main">
        <div className="editor-panel">
          <div className="panel-header">
            <span className="panel-title">输入</span>
            <span className="char-count">{inputText.length} 字符</span>
          </div>
          <textarea
            className="editor-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`请输入需要${mode === 'format' ? '格式化' : '压缩'}的${formatTypes.find(t => t.id === formatType)?.label}文本...`}
            spellCheck={false}
          />
        </div>

        <div className="editor-actions">
          <button className="action-btn primary" onClick={handleFormat}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {mode === 'format' ? '格式化' : '压缩'}
          </button>
          <button className="action-btn" onClick={handleSwap}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            交换
          </button>
          <button className="action-btn" onClick={handleClear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            清空
          </button>
        </div>

        <div className="editor-panel">
          <div className="panel-header">
            <span className="panel-title">输出</span>
            <div className="panel-actions">
              <span className="char-count">{outputText.length} 字符</span>
              {outputText && (
                <button className="copy-btn" onClick={handleCopy}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  复制
                </button>
              )}
            </div>
          </div>
          <textarea
            className="editor-textarea output"
            value={outputText}
            readOnly
            placeholder="格式化结果将显示在这里..."
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

export default TextFormatter
