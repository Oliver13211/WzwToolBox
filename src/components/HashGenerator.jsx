import { useState, useCallback } from 'react'
import './HashGenerator.css'

const HASH_TYPES = [
  { id: 'md5', name: 'MD5', length: 128, description: '128位哈希值' },
  { id: 'sha1', name: 'SHA1', length: 160, description: '160位哈希值' },
  { id: 'sha256', name: 'SHA256', length: 256, description: '256位哈希值' },
  { id: 'sha512', name: 'SHA512', length: 512, description: '512位哈希值' },
  { id: 'sha384', name: 'SHA384', length: 384, description: '384位哈希值' },
]

function HashGenerator() {
  const [input, setInput] = useState('')
  const [hashType, setHashType] = useState('sha256')
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null)

  const computeHash = useCallback(async (text, type) => {
    if (!text.trim()) return null

    try {
      if (window.electronAPI?.computeHash) {
        const result = await window.electronAPI.computeHash(text, type)
        return result.success ? result.hash : null
      } else {
        const algoMap = {
          md5: null,
          sha1: 'SHA-1',
          sha256: 'SHA-256',
          sha384: 'SHA-384',
          sha512: 'SHA-512'
        }
        const algo = algoMap[type]
        if (!algo) return null

        const encoder = new TextEncoder()
        const data = encoder.encode(text)
        const hashBuffer = await crypto.subtle.digest(algo, data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        return hashHex
      }
    } catch (err) {
      console.error('Hash error:', err)
      return null
    }
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) return

    setLoading(true)
    const newResults = {}

    try {
      const hash = await computeHash(input, hashType)
      if (hash) {
        newResults[hashType] = hash
      }
      setResults(newResults)
    } catch (err) {
      console.error('Generate error:', err)
    } finally {
      setLoading(false)
    }
  }, [input, hashType, computeHash])

  const handleCopy = async (hash, type) => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Copy error:', err)
    }
  }

  const handleClear = () => {
    setInput('')
    setResults({})
    setCopied(null)
  }

  const handleUppercase = (hash) => {
    return hash.toUpperCase()
  }

  const handleLowercase = (hash) => {
    return hash.toLowerCase()
  }

  return (
    <div className="hash-generator">
      <div className="input-section">
        <div className="input-header">
          <label>输入文本</label>
          <div className="input-actions">
            <span className="char-count">{input.length} 字符</span>
            {input && (
              <button className="clear-btn" onClick={handleClear}>清空</button>
            )}
          </div>
        </div>
        <textarea
          className="hash-input"
          placeholder="请输入需要生成哈希的文本..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
        />
      </div>

      <div className="action-section">
        <div className="hash-type-selector">
          <label>哈希算法</label>
          <div className="type-buttons">
            {HASH_TYPES.map(type => (
              <button
                key={type.id}
                className={`type-btn ${hashType === type.id ? 'active' : ''}`}
                onClick={() => setHashType(type.id)}
                title={type.description}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>
        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              生成中...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              生成哈希
            </>
          )}
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>哈希结果</h3>
            <div className="results-info">
              <span className="result-count">{Object.keys(results).length} 种算法</span>
            </div>
          </div>

          <div className="results-list">
            {HASH_TYPES.filter(type => results[type.id]).map(type => (
              <div key={type.id} className="result-item">
                <div className="result-header">
                  <div className="result-type">
                    <span className="type-name">{type.name}</span>
                    <span className="type-length">{type.length}位</span>
                  </div>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(handleUppercase(results[type.id]), type.id)}
                  >
                    {copied === type.id ? '已复制' : '复制'}
                  </button>
                </div>
                <div className="result-hash">
                  <code className="hash-value uppercase">{handleUppercase(results[type.id])}</code>
                  <code className="hash-value lowercase">{handleLowercase(results[type.id])}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(results).length === 0 && input.trim() && !loading && (
        <div className="empty-results">
          <p>点击"生成哈希"按钮获取结果</p>
        </div>
      )}

      <div className="hash-info-section">
        <h4>哈希算法说明</h4>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-header">
              <span className="info-title">MD5</span>
              <span className="info-badge warning">不安全</span>
            </div>
            <p className="info-desc">128位哈希值，因存在碰撞漏洞，不建议用于安全领域</p>
          </div>
          <div className="info-card">
            <div className="info-header">
              <span className="info-title">SHA-1</span>
              <span className="info-badge warning">已废弃</span>
            </div>
            <p className="info-desc">160位哈希值，已被谷歌宣布破解，不建议使用</p>
          </div>
          <div className="info-card">
            <div className="info-header">
              <span className="info-title">SHA-256</span>
              <span className="info-badge success">推荐</span>
            </div>
            <p className="info-desc">256位哈希值，目前广泛使用的安全哈希算法</p>
          </div>
          <div className="info-card">
            <div className="info-header">
              <span className="info-title">SHA-384</span>
              <span className="info-badge success">安全</span>
            </div>
            <p className="info-desc">384位哈希值，SHA-512的截断版本，提供较高安全性</p>
          </div>
          <div className="info-card">
            <div className="info-header">
              <span className="info-title">SHA-512</span>
              <span className="info-badge success">安全</span>
            </div>
            <p className="info-desc">512位哈希值，更高安全要求的场景使用</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HashGenerator
