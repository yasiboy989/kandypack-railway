import './AdminDashboard.css'
import { HeartIcon, CartIcon, PackageIcon, MoneyIcon } from '../../components/Icons'
import { useEffect, useState } from 'react'
import { getAdminDashboardStats, type AdminDashboardStats, getAdminChartData, type ChartDataResponse, getAdminAlerts, type DashboardAlert } from '../../lib/api'

function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null)
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadDashboardData = async () => {
      try {
        const [statsData, chartDataRes, alertsData] = await Promise.all([
          getAdminDashboardStats(),
          getAdminChartData().catch(() => null),
          getAdminAlerts().catch(() => []),
        ])

        if (!mounted) return

        setStats(statsData)
        if (chartDataRes) setChartData(chartDataRes)
        if (alertsData && Array.isArray(alertsData)) setAlerts(alertsData)
      } catch (err) {
        console.error('Failed to load admin dashboard:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadDashboardData()

    return () => {
      mounted = false
    }
  }, [])

  const statsCards = stats ? [
    { label: 'Total Orders', value: stats.total_orders.toLocaleString(), change: '+28.4%', trend: 'up', icon: HeartIcon },
    { label: 'Pending Orders', value: stats.pending_orders.toLocaleString(), change: '-12.6%', trend: 'down', icon: CartIcon },
    { label: 'Delivered', value: stats.delivered_orders.toLocaleString(), change: '+3.1%', trend: 'up', icon: PackageIcon },
    { label: 'Active Users', value: stats.active_users.toLocaleString(), change: '+11.3%', trend: 'up', icon: MoneyIcon },
  ] : []

  const systemStats = stats ? [
    { label: 'Train Utilization', value: Math.round(stats.train_utilization), max: 100 },
    { label: 'Truck Utilization', value: Math.round(stats.truck_utilization), max: 100 },
    { label: 'Staff Active', value: stats.staff_active, max: 200 },
  ] : []

  const recentAlerts = alerts.length > 0 ? alerts : [
    { type: 'info', message: 'No active alerts', time: 'now' },
  ]

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div style={{ padding: '24px', textAlign: 'center' }}>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Analytics</h1>
      </div>

      <div className="stats-grid">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">
                  <IconComponent size={24} />
                </span>
                <span className="stat-label">{stat.label}</span>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className={`stat-change ${stat.trend === 'up' ? 'positive' : 'negative'}`}>
                  {stat.change} {stat.trend === 'up' ? '↗' : '↘'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="dashboard-grid">
        <div className="chart-card large">
          <div className="card-header">
            <h2>Revenue by customer type</h2>
            <select className="date-picker">
              <option>📅 Jan 2024 - Dec 2024</option>
            </select>
          </div>
          <div className="chart-area">
            <div className="revenue-stats">
              <div className="revenue-value">${chartData ? `${(chartData.revenue.total / 1000).toFixed(1)}K` : '0K'}</div>
              <div className="badge badge-green badge-dot">{chartData?.revenue.growth_percent || 0}% ↗</div>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--primary-color-1)' }}></span>
                <span>Current clients</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--blue)' }}></span>
                <span>Subscribers</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--secondary-color-3)' }}></span>
                <span>New customers</span>
              </div>
            </div>
            <div className="bar-chart">
              {chartData && Object.entries(chartData.revenue.monthly_data).slice(0, 12).map(([month, data], i) => {
                const currentClientHeight = Math.min(data.current_clients / 10, 200)
                const subscribersHeight = Math.min(data.subscribers / 10, 200)
                const newCustomersHeight = Math.min(data.new_customers / 10, 200)
                return (
                  <div key={i} className="bar-group" title={month}>
                    <div className="bar" style={{ height: `${currentClientHeight}px`, background: 'var(--primary-color-1)' }}></div>
                    <div className="bar" style={{ height: `${subscribersHeight}px`, background: 'var(--blue)' }}></div>
                    <div className="bar" style={{ height: `${newCustomersHeight}px`, background: 'var(--secondary-color-3)' }}></div>
                  </div>
                )
              })}
              {!chartData && [69, 107, 133, 150, 107, 176, 60, 154, 86, 26, 58, 107].map((height, i) => (
                <div key={i} className="bar-group">
                  <div className="bar" style={{ height: `${height}px`, background: 'var(--primary-color-1)' }}></div>
                  <div className="bar" style={{ height: `${height * 0.5}px`, background: 'var(--blue)' }}></div>
                  <div className="bar" style={{ height: `${height * 0.3}px`, background: 'var(--secondary-color-3)' }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <h2>Revenue by Type</h2>
            <button className="btn-secondary">Export ↓</button>
          </div>
          <div className="donut-chart">
            <div className="donut-center">
              <div className="donut-value">${chartData ? `${(chartData.revenue_analysis.total / 1000).toFixed(0)}k` : '0k'}</div>
            </div>
          </div>
          <div className="chart-stats">
            <div className="stat-row">
              <div className="stat-dot" style={{ background: 'var(--primary-color-1)' }}></div>
              <span>Wholesale</span>
              <span className="stat-percent">{chartData?.revenue_analysis.wholesale.percent || 0}%</span>
            </div>
            <div className="stat-row">
              <div className="stat-dot" style={{ background: 'var(--blue)' }}></div>
              <span>Retail</span>
              <span className="stat-percent">{chartData?.revenue_analysis.retail.percent || 0}%</span>
            </div>
            <div className="stat-row">
              <div className="stat-dot" style={{ background: 'var(--secondary-color-3)' }}></div>
              <span>Total Orders</span>
              <span className="stat-percent">{chartData ? (chartData.revenue_analysis.wholesale.orders + chartData.revenue_analysis.retail.orders) : 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="alerts-section">
        <h2>Recent Alerts</h2>
        <div className="alerts-list">
          {recentAlerts.map((alert, index) => (
            <div key={index} className={`alert-item ${alert.type}`}>
              <div className="alert-icon">
                {alert.type === 'error' && '❌'}
                {alert.type === 'warning' && '⚠️'}
                {alert.type === 'info' && 'ℹ️'}
              </div>
              <div className="alert-content">
                <div className="alert-message">{alert.message}</div>
                <div className="alert-time">{alert.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="system-stats">
        <h2>System Utilization</h2>
        <div className="utilization-grid">
          {systemStats.map((stat, index) => (
            <div key={index} className="utilization-card">
              <div className="utilization-header">
                <span className="utilization-label">{stat.label}</span>
                <span className="utilization-value">{stat.value}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(stat.value / stat.max) * 100}%` }}
                ></div>
              </div>
              <div className="utilization-meta">
                {stat.value} / {stat.max}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
