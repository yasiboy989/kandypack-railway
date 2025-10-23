import './AdminDashboard.css'
import { HeartIcon, CartIcon, PackageIcon, MoneyIcon } from '../../components/Icons'
import { useEffect, useState } from 'react'
import { getAdminDashboardStats, type AdminDashboardStats } from '../../lib/api'

function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getAdminDashboardStats()
      .then((data) => {
        if (!mounted) return
        setStats(data)
      })
      .catch((err) => {
        console.error('Failed to load admin dashboard stats:', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    
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

  const recentAlerts = [
    { type: 'error', message: 'Failed delivery in Route #123', time: '2 mins ago' },
    { type: 'warning', message: 'Train capacity near limit for Trip #456', time: '15 mins ago' },
    { type: 'info', message: 'New staff member registered', time: '1 hour ago' },
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
        <button className="btn-primary">May 2023 ▼</button>
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
              <div className="revenue-value">$240.8K</div>
              <div className="badge badge-green badge-dot">14.8% ↗</div>
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
              {[69, 107, 133, 150, 107, 176, 60, 154, 86, 26, 58, 107].map((height, i) => (
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
            <h2>Website Visitors</h2>
            <button className="btn-secondary">Export ↓</button>
          </div>
          <div className="donut-chart">
            <div className="donut-center">
              <div className="donut-value">150k</div>
            </div>
          </div>
          <div className="chart-stats">
            <div className="stat-row">
              <div className="stat-dot" style={{ background: 'var(--primary-color-1)' }}></div>
              <span>Organic</span>
              <span className="stat-percent">30%</span>
            </div>
            <div className="stat-row">
              <div className="stat-dot" style={{ background: 'var(--blue)' }}></div>
              <span>Social</span>
              <span className="stat-percent">50%</span>
            </div>
            <div className="stat-row">
              <div className="stat-dot" style={{ background: 'var(--secondary-color-3)' }}></div>
              <span>Direct</span>
              <span className="stat-percent">20%</span>
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
