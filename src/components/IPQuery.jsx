import { useState, useCallback } from 'react'
import './IPQuery.css'

function IPQuery() {
  const [ipAddress, setIpAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [ipInfo, setIpInfo] = useState(null)

  const queryIP = useCallback(async () => {
    if (!ipAddress.trim()) {
      setError('请输入 IP 地址')
      return
    }

    setLoading(true)
    setError(null)
    setIpInfo(null)

    try {
      // 使用 ipapi.co 免费 API
      const response = await fetch(`https://ipapi.co/${ipAddress.trim()}/json/`)
      const data = await response.json()

      if (data.error) {
        setError(data.reason || '查询失败，请检查 IP 地址是否正确')
      } else {
        setIpInfo({
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country_name,
          countryCode: data.country_code,
          continent: data.continent_code,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          utcOffset: data.utc_offset,
          isp: data.org || data.asn,
          asn: data.asn,
          currency: data.currency,
          currencyName: data.currency_name,
          languages: data.languages,
          callingCode: data.country_calling_code,
          capital: data.country_capital,
          population: data.country_population,
          area: data.country_area,
          tld: data.country_tld,
          postal: data.postal,
        })
      }
    } catch (err) {
      setError('网络请求失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }, [ipAddress])

  const queryMyIP = useCallback(async () => {
    setLoading(true)
    setError(null)
    setIpInfo(null)

    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()

      if (data.error) {
        setError(data.reason || '查询失败')
      } else {
        setIpInfo({
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country_name,
          countryCode: data.country_code,
          continent: data.continent_code,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          utcOffset: data.utc_offset,
          isp: data.org || data.asn,
          asn: data.asn,
          currency: data.currency,
          currencyName: data.currency_name,
          languages: data.languages,
          callingCode: data.country_calling_code,
          capital: data.country_capital,
          population: data.country_population,
          area: data.country_area,
          tld: data.country_tld,
          postal: data.postal,
        })
        setIpAddress(data.ip)
      }
    } catch (err) {
      setError('网络请求失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      queryIP()
    }
  }

  const formatNumber = (num) => {
    if (!num) return '-'
    return num.toLocaleString()
  }

  return (
    <div className="ip-query">
      <div className="query-section">
        <div className="input-group">
          <input
            type="text"
            className="ip-input"
            placeholder="请输入 IP 地址 (例如: 8.8.8.8)"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="query-btn primary"
            onClick={queryIP}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                查询中...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                查询
              </>
            )}
          </button>
          <button
            className="query-btn secondary"
            onClick={queryMyIP}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            我的 IP
          </button>
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

      {ipInfo && (
        <div className="result-section">
          <div className="result-card">
            <div className="result-header">
              <div className="ip-display">
                <span className="ip-label">IP 地址</span>
                <span className="ip-value">{ipInfo.ip}</span>
              </div>
              <div className="location-badge">
                <img
                  src={`https://flagcdn.com/w40/${ipInfo.countryCode?.toLowerCase()}.png`}
                  alt={ipInfo.country}
                  className="flag"
                />
                <span>{ipInfo.country}</span>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-section">
                <h4>地理位置</h4>
                <div className="info-list">
                  <div className="info-item">
                    <span className="label">国家/地区</span>
                    <span className="value">{ipInfo.country || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">省份/州</span>
                    <span className="value">{ipInfo.region || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">城市</span>
                    <span className="value">{ipInfo.city || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">邮编</span>
                    <span className="value">{ipInfo.postal || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">坐标</span>
                    <span className="value">
                      {ipInfo.latitude && ipInfo.longitude
                        ? `${ipInfo.latitude}, ${ipInfo.longitude}`
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>网络信息</h4>
                <div className="info-list">
                  <div className="info-item">
                    <span className="label">ISP / 运营商</span>
                    <span className="value">{ipInfo.isp || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">ASN</span>
                    <span className="value">{ipInfo.asn || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">时区</span>
                    <span className="value">{ipInfo.timezone || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">UTC 偏移</span>
                    <span className="value">{ipInfo.utcOffset || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>国家/地区信息</h4>
                <div className="info-list">
                  <div className="info-item">
                    <span className="label">首都</span>
                    <span className="value">{ipInfo.capital || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">人口</span>
                    <span className="value">{formatNumber(ipInfo.population)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">面积</span>
                    <span className="value">{ipInfo.area ? `${formatNumber(ipInfo.area)} km²` : '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">电话区号</span>
                    <span className="value">{ipInfo.callingCode || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">顶级域名</span>
                    <span className="value">{ipInfo.tld || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">货币</span>
                    <span className="value">
                      {ipInfo.currency && ipInfo.currencyName
                        ? `${ipInfo.currency} (${ipInfo.currencyName})`
                        : '-'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">语言</span>
                    <span className="value">{ipInfo.languages || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IPQuery
