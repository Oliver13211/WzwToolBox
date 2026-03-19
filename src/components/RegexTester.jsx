import { useState, useMemo, useCallback } from 'react'
import './RegexTester.css'

function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [testText, setTestText] = useState('')
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false })
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const commonTemplates = [
    { id: 'email', name: '邮箱地址', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: '匹配标准邮箱格式' },
    { id: 'phone-cn', name: '手机号码(中国)', pattern: '1[3-9]\\d{9}', description: '匹配中国大陆手机号' },
    { id: 'url', name: 'URL地址', pattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*$', description: '匹配HTTP/HTTPS链接' },
    { id: 'ip', name: 'IP地址', pattern: '((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)', description: '匹配IPv4地址' },
    { id: 'date', name: '日期(YYYY-MM-DD)', pattern: '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])', description: '匹配标准日期格式' },
    { id: 'time', name: '时间(HH:MM:SS)', pattern: '([01]?\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?', description: '匹配时间格式' },
    { id: 'id-card-cn', name: '身份证号(中国)', pattern: '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]', description: '匹配18位身份证号' },
    { id: 'hex-color', name: '十六进制颜色', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})', description: '匹配HEX颜色值' },
    { id: 'chinese', name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+', description: '匹配中文字符' },
    { id: 'number', name: '数字', pattern: '-?\\d+(\\.\\d+)?', description: '匹配整数和小数' },
    { id: 'word', name: '单词字符', pattern: '\\w+', description: '匹配字母数字下划线' },
    { id: 'whitespace', name: '空白字符', pattern: '\\s+', description: '匹配空格制表符换行' }
  ]

  const flagLabels = {
    g: { label: '全局', desc: '查找所有匹配' },
    i: { label: '忽略大小写', desc: '不区分大小写' },
    m: { label: '多行', desc: '^$匹配行首行尾' },
    s: { label: '点匹配换行', desc: '.匹配所有字符' },
    u: { label: 'Unicode', desc: 'Unicode模式' }
  }

  const regexResult = useMemo(() => {
    if (!pattern) return { regex: null, error: '' }
    
    try {
      const flagStr = Object.entries(flags)
        .filter(([, enabled]) => enabled)
        .map(([flag]) => flag)
        .join('')
      
      const re = new RegExp(pattern, flagStr)
      return { regex: re, error: '' }
    } catch (e) {
      return { regex: null, error: '正则表达式语法错误: ' + e.message }
    }
  }, [pattern, flags])

  const matchResult = useMemo(() => {
    const { regex } = regexResult
    if (!regex || !testText) return { matches: [], error: '' }
    
    try {
      const results = []
      if (flags.g) {
        let match
        const re = new RegExp(regex.source, regex.flags)
        while ((match = re.exec(testText)) !== null) {
          results.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          })
          if (match[0].length === 0) {
            re.lastIndex++
          }
        }
      } else {
        const match = regex.exec(testText)
        if (match) {
          results.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          })
        }
      }
      return { matches: results, error: '' }
    } catch (e) {
      return { matches: [], error: '匹配错误: ' + e.message }
    }
  }, [regexResult, testText, flags.g])

  const error = regexResult.error || matchResult.error
  const matches = matchResult.matches

  const highlightedText = useMemo(() => {
    if (!testText || matches.length === 0) {
      return testText
    }

    const positions = matches.map(m => ({ start: m.index, end: m.index + m.value.length }))
    positions.sort((a, b) => a.start - b.start)

    const mergedPositions = []
    positions.forEach(pos => {
      if (mergedPositions.length === 0) {
        mergedPositions.push({ ...pos })
      } else {
        const last = mergedPositions[mergedPositions.length - 1]
        if (pos.start <= last.end) {
          last.end = Math.max(last.end, pos.end)
        } else {
          mergedPositions.push({ ...pos })
        }
      }
    })

    const result = []
    let lastIndex = 0
    
    mergedPositions.forEach((pos, idx) => {
      if (pos.start > lastIndex) {
        result.push(
          <span key={`text-${idx}`} className="normal-text">
            {testText.slice(lastIndex, pos.start)}
          </span>
        )
      }
      result.push(
        <span key={`match-${idx}`} className="highlight-text">
          {testText.slice(pos.start, pos.end)}
        </span>
      )
      lastIndex = pos.end
    })

    if (lastIndex < testText.length) {
      result.push(
        <span key="text-end" className="normal-text">
          {testText.slice(lastIndex)}
        </span>
      )
    }

    return result
  }, [testText, matches])

  const handleFlagToggle = useCallback((flag) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }))
  }, [])

  const handleTemplateSelect = useCallback((template) => {
    if (selectedTemplate === template.id) {
      setSelectedTemplate(null)
      setPattern('')
    } else {
      setSelectedTemplate(template.id)
      setPattern(template.pattern)
    }
  }, [selectedTemplate])

  const handleClear = () => {
    setPattern('')
    setTestText('')
    setSelectedTemplate(null)
  }

  const handleCopyPattern = async () => {
    if (pattern) {
      try {
        await navigator.clipboard.writeText(`/${pattern}/${Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('')}`)
      } catch (e) {
        console.error('复制失败:', e)
      }
    }
  }

  const stats = useMemo(() => ({
    total: matches.length,
    unique: [...new Set(matches.map(m => m.value))].length,
    positions: matches.map(m => ({ value: m.value, index: m.index }))
  }), [matches])

  return (
    <div className="regex-tester">
      <div className="regex-input-section">
        <div className="pattern-row">
          <div className="pattern-wrapper">
            <span className="pattern-slash">/</span>
            <input
              type="text"
              className="pattern-input"
              value={pattern}
              onChange={(e) => { setPattern(e.target.value); setSelectedTemplate(null) }}
              placeholder="输入正则表达式..."
              spellCheck={false}
            />
            <span className="pattern-slash">/{Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('')}</span>
            <button className="copy-pattern-btn" onClick={handleCopyPattern} title="复制正则表达式">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="flags-templates-row">
          <div className="flags-section">
            <span className="flags-label">模式:</span>
            <div className="flags-buttons">
              {Object.entries(flagLabels).map(([flag, { label, desc }]) => (
                <button
                  key={flag}
                  className={`flag-btn ${flags[flag] ? 'active' : ''}`}
                  onClick={() => handleFlagToggle(flag)}
                  title={desc}
                >
                  <span className="flag-char">{flag}</span>
                  <span className="flag-label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="templates-section">
            <div className="templates-header">
              <span className="templates-title">常用模板</span>
            </div>
            <div className="templates-grid">
              {commonTemplates.map(template => (
                <button
                  key={template.id}
                  className={`template-btn ${selectedTemplate === template.id ? 'active' : ''}`}
                  onClick={() => handleTemplateSelect(template)}
                  title={template.description}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="test-section">
        <div className="test-panel">
          <div className="panel-header">
            <span className="panel-title">测试文本</span>
            <span className="char-count">{testText.length} 字符</span>
          </div>
          <textarea
            className="test-textarea"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="输入需要测试的文本..."
            spellCheck={false}
          />
        </div>

        <div className="test-panel">
          <div className="panel-header">
            <span className="panel-title">匹配结果</span>
            <div className="match-stats">
              <span className="stat-item">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">匹配</span>
              </span>
              <span className="stat-item">
                <span className="stat-value">{stats.unique}</span>
                <span className="stat-label">唯一</span>
              </span>
            </div>
          </div>
          <div className="result-area">
            {testText ? (
              <div className="highlighted-result">{highlightedText}</div>
            ) : (
              <div className="empty-hint">输入测试文本后显示匹配结果</div>
            )}
          </div>
        </div>
      </div>

      <div className="matches-section">
        <div className="matches-header">
          <span className="matches-title">匹配详情</span>
          <button className="clear-btn" onClick={handleClear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            清空
          </button>
        </div>
        
        {matches.length > 0 ? (
          <div className="matches-list">
            {matches.map((match, idx) => (
              <div key={idx} className="match-item">
                <div className="match-index">#{idx + 1}</div>
                <div className="match-content">
                  <div className="match-value">
                    <span className="value-label">匹配值:</span>
                    <span className="value-text">{match.value || '(空)'}</span>
                  </div>
                  <div className="match-position">
                    <span className="position-label">位置:</span>
                    <span className="position-value">{match.index}</span>
                  </div>
                  {match.groups && match.groups.length > 0 && (
                    <div className="match-groups">
                      <span className="groups-label">捕获组:</span>
                      <div className="groups-list">
                        {match.groups.map((group, gIdx) => (
                          <span key={gIdx} className="group-item">
                            ${gIdx + 1}: {group || '(空)'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-matches">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
            </svg>
            <span>{pattern ? '未找到匹配' : '输入正则表达式开始测试'}</span>
          </div>
        )}
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

export default RegexTester
