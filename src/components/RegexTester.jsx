import { useState, useMemo, useCallback } from 'react'
import './RegexTester.css'

function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [testText, setTestText] = useState('')
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false })

  const flagLabels = {
    g: { label: '全局', desc: '查找所有匹配' },
    i: { label: '忽略大小写', desc: '不区分大小写' },
    m: { label: '多行', desc: '^$匹配行首行尾' },
    s: { label: '点匹配换行', desc: '.匹配所有字符' },
    u: { label: 'Unicode', desc: 'Unicode模式' }
  }

  const templates = [
    { name: '邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: '手机号', pattern: '1[3-9]\\d{9}' },
    { name: 'URL', pattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*$' },
    { name: 'IP地址', pattern: '((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)' },
    { name: '日期', pattern: '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])' },
    { name: '身份证', pattern: '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]' },
    { name: '中文', pattern: '[\\u4e00-\\u9fa5]+' },
    { name: '数字', pattern: '-?\\d+(\\.\\d+)?' }
  ]

  const regexResult = useMemo(() => {
    if (!pattern) return { regex: null, error: '' }
    try {
      const flagStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('')
      return { regex: new RegExp(pattern, flagStr), error: '' }
    } catch (e) {
      return { regex: null, error: '正则语法错误' }
    }
  }, [pattern, flags])

  const matches = useMemo(() => {
    const { regex } = regexResult
    if (!regex || !testText) return []
    const results = []
    if (flags.g) {
      let match
      const re = new RegExp(regex.source, regex.flags)
      while ((match = re.exec(testText)) !== null) {
        results.push({ text: match[0], index: match.index })
        if (match[0].length === 0) re.lastIndex++
      }
    } else {
      const match = regex.exec(testText)
      if (match) results.push({ text: match[0], index: match.index })
    }
    return results
  }, [regexResult, testText, flags.g])

  const handleFlagToggle = useCallback((flag) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }))
  }, [])

  const handleTemplate = (tpl) => setPattern(tpl.pattern)

  const handleClear = () => {
    setPattern('')
    setTestText('')
  }

  return (
    <div className="regex-tester">
      <div className="regex-toolbar">
        <div className="pattern-input-wrapper">
          <span className="pattern-slash">/</span>
          <input
            type="text"
            className="pattern-input"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="输入正则表达式..."
          />
          <span className="pattern-flags">/{Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('')}</span>
        </div>

        <div className="flags-row">
          <span className="toolbar-label">模式:</span>
          <div className="flags-group">
            {Object.entries(flagLabels).map(([flag, { label }]) => (
              <button
                key={flag}
                className={`flag-btn ${flags[flag] ? 'active' : ''}`}
                onClick={() => handleFlagToggle(flag)}
              >
                <span className="flag-char">{flag}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="templates-row">
          <span className="toolbar-label">模板:</span>
          <div className="templates-group">
            {templates.map((tpl, idx) => (
              <button key={idx} className="template-btn" onClick={() => handleTemplate(tpl)}>
                {tpl.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="regex-main">
        <div className="regex-panel">
          <div className="panel-header">
            <span>测试文本</span>
            <span className="char-count">{testText.length} 字符</span>
          </div>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="输入需要测试的文本..."
          />
        </div>

        <div className="regex-actions">
          <div className="match-info">
            <span className="match-count">{matches.length}</span>
            <span>匹配</span>
          </div>
          <button className="action-btn clear" onClick={handleClear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
            清空
          </button>
        </div>

        <div className="regex-panel result-panel">
          <div className="panel-header">
            <span>匹配结果</span>
          </div>
          <div className="result-content">
            {testText ? (
              matches.length > 0 ? (
                <div className="matches-list">
                  {matches.map((m, i) => (
                    <div key={i} className="match-item">
                      <span className="match-num">#{i + 1}</span>
                      <span className="match-text">{m.text || '(空)'}</span>
                      <span className="match-pos">@{m.index}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-result">未找到匹配</div>
              )
            ) : (
              <div className="no-result">输入测试文本</div>
            )}
          </div>
        </div>
      </div>

      {regexResult.error && (
        <div className="regex-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
          {regexResult.error}
        </div>
      )}
    </div>
  )
}

export default RegexTester
