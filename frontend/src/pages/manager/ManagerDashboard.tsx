import './ManagerDashboard.css'

function ManagerDashboard() {
  const stats = [
    { label: 'Ongoing Train Trips', value: '4', change: '+1', trend: 'up', icon: '🚂' },
    { label: 'Trucks on Route', value: '12', change: '-2', trend: 'down', icon: '🚛' },
    { label: 'Pending Orders', value: '36', change: '+5', trend: 'up', icon: '📦' },
    { label: 'Staff Availability', value: '85%', change: '+3%', trend: 'up', icon: '👥' },
  ]

  const highPriorityAlerts = [
    { type: 'error', message: 'Truck #102: Engine temperature high', time: '5 mins ago' },
    { type: 'warning', message: 'Train Trip #56: Nearing capacity limit', time: '25 mins ago' },
    { type: 'info', message: 'Route #7: Road closure reported', time: '1 hour ago' },
  ]

  const trainUtilization = [
    { label: 'Trip #56 (Kandy → Colombo)', value: 92, max: 100 },
    { label: 'Trip #57 (Colombo → Galle)', value: 75, max: 100 },
    { label: 'Trip #58 (Kandy → Jaffna)', value: 60, max: 100 },
  ]

  return (
    <div className="manager-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Logistics Overview</h1>
        <button className="btn-primary">Today ▼</button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-change ${stat.trend === 'up' ? 'positive' : 'negative'}`}>
                {stat.change} {stat.trend === 'up' ? '↗' : '↘'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="chart-card large">
          <div className="card-header">
            <h2>Daily Schedule Overview</h2>
            <select className="date-picker">
              <option>📅 Today</option>
            </select>
          </div>
          {/* This would be a timeline component in a real app */}
        </div>

        <div className="chart-card">
          <div className="card-header">
            <h2>High-Priority Alerts</h2>
          </div>
          <div className="alerts-list">
            {highPriorityAlerts.map((alert, index) => (
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
      </div>

      <div className="system-stats">
        <h2>Train Capacity Utilization</h2>
        <div className="utilization-grid">
          {trainUtilization.map((stat, index) => (
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
                {stat.value} / {stat.max} capacity
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard