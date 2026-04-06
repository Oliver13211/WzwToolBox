import { useState, useCallback, useRef, useEffect } from 'react'
import './PingTest.css'

const QUICK_HOSTS = [
  { name: '百度', host: 'baidu.com' },
  { name: 'Google', host: 'google.com' },
  { name: '阿里云', host: 'aliyun.com' },
  { name: 'Cloudflare', host: 'cloudflare.com' },
  { name: 'GitHub', host: 'github.com' },
  { name: '本地', host: '127.0.0.1' },
]

function PingTest() {
  const [host, setHost] = useState('')
  const [count, setCount] = useState(4)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)
  const abortRef = useRef(false)

  useEffect(() => {
    return () => {
      abortRef.current = true
    }
  }, [])

  const parsePingOutput = (output, isWindows) => {
    const packets = []

    if (isWindows) {
      const lines = output.split('\n')
      let seq = 0
      for (const line of lines) {
        const match = line.match(/来自\s+([\d.]+)\s+的回复[:：]\s*字节[=＝](\d+)\s*时间[<＝=](\d+)ms\s*TTL[=＝](\d+)/i)
        if (match) {
          seq++
          packets.push({
            seq,
            bytes: parseInt(match[2]),
            time: parseInt(match[3]),
            ttl: parseInt(match[4]),
            status: 'success'
          })
        }
        const timeoutMatch = line.match(/请求超时|无法访问目标主机/i)
        if (timeoutMatch) {
          seq++
          packets.push({
            seq,
            bytes: 0,
            time: null,
            ttl: null,
            status: 'timeout'
          })
        }
      }

      const statsMatch = output.match(/数据包[:：]\s*已发送\s*[=＝]\s*(\d+)[，,]\s*已接收\s*[=＝]\s*(\d+)[，,]\s*丢失\s*[=＝]\s*(\d+)/i)
      const avgMatch = output.match(/平均\s*[=＝]\s*(\d+)ms/i)
      const minMatch = output.match(/最短\s*[=＝]\s*(\d+)ms/i)
      const maxMatch = output.match(/最长\s*[=＝]\s*(\d+)ms/i)

      if (statsMatch) {
        const sent = parseInt(statsMatch[1])
        const received = parseInt(statsMatch[2])
        const lost = parseInt(statsMatch[3])
        return {
          packets,
          stats: {
            sent,
            received,
            lost,
            lossRate: sent > 0 ? ((lost / sent) * 100).toFixed(1) : 0,
            minTime: minMatch ? parseInt(minMatch[1]) : null,
            maxTime: maxMatch ? parseInt(maxMatch[1]) : null,
            avgTime: avgMatch ? parseInt(avgMatch[1]) : null
          }
        }
      }
      
      if (packets.length > 0) {
        return {
          packets,
          stats: {
            sent: packets.length,
            received: packets.filter(p => p.status === 'success').length,
            lost: packets.filter(p => p.status !== 'success').length,
            lossRate: ((packets.filter(p => p.status !== 'success').length / packets.length) * 100).toFixed(1),
            minTime: packets.filter(p => p.time).length > 0 ? Math.min(...packets.filter(p => p.time).map(p => p.time)) : null,
            maxTime: packets.filter(p => p.time).length > 0 ? Math.max(...packets.filter(p => p.time).map(p => p.time)) : null,
            avgTime: packets.filter(p => p.time).length > 0 ? Math.round(packets.filter(p => p.time).reduce((a, b) => a + b.time, 0) / packets.filter(p => p.time).length) : null
          }
        }
      }
    } else {
      const lines = output.split('\n')
      let seq = 0
      for (const line of lines) {
        const match = line.match(/(\d+)\s+bytes\s+from\s+[\d.]+(?:\s+\([^)]+\))?:\s+(?:icmp_seq=(\d+)\s+)?ttl=(\d+)\s+time=([\d.]+)\s*ms/i)
        if (match) {
          seq = parseInt(match[2]) || seq + 1
          packets.push({
            seq,
            bytes: parseInt(match[1]),
            time: parseFloat(match[4]),
            ttl: parseInt(match[3]),
            status: 'success'
          })
        }
        if (line.match(/Request timeout/i)) {
          seq++
          packets.push({
            seq,
            bytes: 0,
            time: null,
            ttl: null,
            status: 'timeout'
          })
        }
      }

      const statsMatch = output.match(/(\d+)\s+packets transmitted,\s*(\d+)\s+received,\s*([\d.]+)%\s+packet loss/i)
      const rttMatch = output.match(/rtt\s+min\/avg\/max\/mdev\s*=\s*([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+)\s*ms/i)

      if (statsMatch) {
        const sent = parseInt(statsMatch[1])
        const received = parseInt(statsMatch[2])
        const lossRate = parseFloat(statsMatch[3])
        return {
          packets,
          stats: {
            sent,
            received,
            lost: sent - received,
            lossRate,
            minTime: rttMatch ? parseFloat(rttMatch[1]) : null,
            maxTime: rttMatch ? parseFloat(rttMatch[3]) : null,
            avgTime: rttMatch ? parseFloat(rttMatch[2]) : null
          }
        }
      }
      
      if (packets.length > 0) {
        return {
          packets,
          stats: {
            sent: packets.length,
            received: packets.filter(p => p.status === 'success').length,
            lost: packets.filter(p => p.status !== 'success').length,
            lossRate: ((packets.filter(p => p.status !== 'success').length / packets.length) * 100).toFixed(1),
            minTime: packets.filter(p => p.time).length > 0 ? Math.min(...packets.filter(p => p.time).map(p => p.time)) : null,
            maxTime: packets.filter(p => p.time).length > 0 ? Math.max(...packets.filter(p => p.time).map(p => p.time)) : null,
            avgTime: packets.filter(p => p.time).length > 0 ? (packets.filter(p => p.time).reduce((a, b) => a + b.time, 0) / packets.filter(p => p.time).length).toFixed(1) : null
          }
        }
      }
    }

    return { packets, stats: null }
  }

  const runPing = useCallback(async () => {
    if (!host.trim()) {
      return
    }

    setLoading(true)
    setError(null)
    setResults([])
    setStats(null)
    abortRef.current = false

    try {
      if (window.electronAPI?.ping) {
        const pingCount = Math.min(Math.max(count, 1), 10)
        const result = await window.electronAPI.ping(host.trim(), pingCount, 8000)

        if (abortRef.current) return

        if (result.success) {
          const parsed = parsePingOutput(result.output, result.isWindows)

          if (parsed.packets.length > 0) {
            setResults(parsed.packets)
          } else {
            setError('未能解析 Ping 结果，请检查目标地址是否正确')
          }

          if (parsed.stats) {
            setStats(parsed.stats)
          }
        } else {
          setError(result.error || 'Ping 测试失败')
        }
      } else {
        setError('Ping 功能不可用，请检查 Electron 环境')
      }
    } catch (err) {
      setError(err.message || 'Ping 测试失败')
    } finally {
      setLoading(false)
    }
  }, [host, count])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      runPing()
    }
  }

  const quickPing = (quickHost) => {
    setHost(quickHost)
    setTimeout(() => {
      runPing()
    }, 100)
  }

  const clearResults = () => {
    setResults([])
    setStats(null)
    setError(null)
  }

  return (
    <div className="ping-test">
      <div className="ping-section">
        <div className="input-row">
          <input
            type="text"
            className="host-input"
            placeholder="请输入主机地址 (域名或 IP)"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <div className="count-selector">
            <label>次数:</label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              disabled={loading}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
            </select>
          </div>
          <button
            className="ping-btn"
            onClick={runPing}
            disabled={loading || !host.trim()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                测试中...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                开始 Ping
              </>
            )}
          </button>
          {results.length > 0 && (
            <button className="clear-btn" onClick={clearResults}>
              清空
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>Ping 结果</h3>
            <span className="target-info">目标: {host}</span>
          </div>

          <div className="packets-list">
            {results.map((packet, index) => (
              <div
                key={index}
                className={`packet-item ${packet.status}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="seq-num">#{packet.seq || index + 1}</span>
                {packet.status === 'success' ? (
                  <>
                    <span className="packet-bytes">{packet.bytes} bytes</span>
                    <span className="packet-time">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      {packet.time} ms
                    </span>
                    <span className="packet-ttl">TTL={packet.ttl}</span>
                  </>
                ) : (
                  <span className="packet-error">
                    {packet.status === 'timeout' ? '请求超时' : packet.error || '请求失败'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && (
        <div className="stats-section">
          <div className="stats-header">
            <h3>统计信息</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">已发送</span>
              <span className="stat-value">{stats.sent}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">已接收</span>
              <span className="stat-value success">{stats.received}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">丢失</span>
              <span className="stat-value error">{stats.lost}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">丢包率</span>
              <span className={`stat-value ${parseFloat(stats.lossRate) > 0 ? 'warning' : 'success'}`}>
                {stats.lossRate}%
              </span>
            </div>
          </div>

          {stats.avgTime !== null && (
            <div className="rtt-stats">
              <div className="rtt-item">
                <span className="rtt-label">最小延迟</span>
                <span className="rtt-value">{stats.minTime} ms</span>
              </div>
              <div className="rtt-item">
                <span className="rtt-label">平均延迟</span>
                <span className="rtt-value highlight">{stats.avgTime} ms</span>
              </div>
              <div className="rtt-item">
                <span className="rtt-label">最大延迟</span>
                <span className="rtt-value">{stats.maxTime} ms</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="quick-ping-section">
        <h4>快速测试</h4>
        <div className="quick-ping-buttons">
          {QUICK_HOSTS.map(item => (
            <button
              key={item.host}
              onClick={() => quickPing(item.host)}
              disabled={loading}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="ping-info-section">
        <h4>使用说明</h4>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="info-content">
              <span className="info-title">成功响应</span>
              <span className="info-desc">目标主机可达，显示延迟和 TTL</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon timeout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="info-content">
              <span className="info-title">请求超时</span>
              <span className="info-desc">目标主机可能禁用了 ICMP 或网络不通</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div className="info-content">
              <span className="info-title">请求失败</span>
              <span className="info-desc">域名解析失败或目标地址无效</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PingTest
