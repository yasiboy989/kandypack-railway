import './WarehouseDashboard.css'

function WarehouseDashboard() {
  const stats = [
    { label: 'Incoming Shipments', value: '3', icon: '🚂' },
    { label: 'Outgoing Dispatches', value: '8', icon: '🚛' },
    { label: 'Items to be Stocked', value: '15', icon: '📦' },
    { label: 'Low Stock Alerts', value: '2', icon: '⚠️' },
  ]

  const recentActivities = [
    { message: 'Train Trip #56 unloaded successfully.', time: '45 mins ago' },
    { message: 'Dispatch for Route #7 prepared.', time: '1 hour ago' },
    { message: 'Inventory for Product #102 updated.', time: '2 hours ago' },
  ]

  return (
    <div className="warehouse-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Warehouse Overview</h1>
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
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="chart-card large">
          <div className="card-header">
            <h2>Recent Activities</h2>
          </div>
          <div className="activities-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-message">{activity.message}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WarehouseDashboard