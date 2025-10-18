import './DriverDashboard.css'

function DriverDashboard() {
  const stats = {
    today: 5,
    pending: 2,
    completed: 3,
  }

  const currentTask = {
    orderId: 'ORD004',
    customerName: 'Graham Hills',
    address: '123, Main Street, Colombo 07',
    status: 'in-transit'
  }

  return (
    <div className="driver-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Driver Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Today's Deliveries</div>
          <div className="stat-value">{stats.today}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{stats.completed}</div>
        </div>
      </div>

      <div className="current-task-card">
        <div className="card-header">
          <h2>Current Task</h2>
        </div>
        <div className="task-details">
          <div className="task-info">
            <div className="info-label">Order ID:</div>
            <div className="info-value">{currentTask.orderId}</div>
          </div>
          <div className="task-info">
            <div className="info-label">Customer:</div>
            <div className="info-value">{currentTask.customerName}</div>
          </div>
          <div className="task-info">
            <div className="info-label">Address:</div>
            <div className="info-value">{currentTask.address}</div>
          </div>
          <div className="task-info">
            <div className="info-label">Status:</div>
            <div className="info-value">
              <span className={`status-badge ${currentTask.status}`}>
                {currentTask.status}
              </span>
            </div>
          </div>
        </div>
        <div className="task-actions">
          <button className="btn-primary">View Details</button>
        </div>
      </div>
    </div>
  )
}

export default DriverDashboard