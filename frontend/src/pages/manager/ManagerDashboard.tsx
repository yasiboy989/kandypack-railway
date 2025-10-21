import { Link } from 'react-router-dom'
import './ManagerDashboard.css'

function ManagerDashboard() {
  const upcomingTrips = [
    { id: 'T-145', type: 'Train', route: 'City A → City B', date: '2025-01-05', capacity: '85%', status: 'On Schedule' },
    { id: 'T-146', type: 'Train', route: 'City C → City D', date: '2025-01-06', capacity: '92%', status: 'Near Full' },
    { id: 'TR-234', type: 'Truck', route: 'Warehouse → Zone 5', date: '2025-01-05', capacity: '70%', status: 'On Schedule' },
  ]

  const pendingOrders = [
    { id: '#1540', customer: 'Acme Corp', items: 5, deadline: '2025-01-10', priority: 'High' },
    { id: '#1541', customer: 'Tech Inc', items: 3, deadline: '2025-01-12', priority: 'Medium' },
    { id: '#1542', customer: 'Global LLC', items: 8, deadline: '2025-01-08', priority: 'High' },
  ]

  const alerts = [
    { type: 'warning', message: 'Train T-146 capacity at 92% - consider overflow planning', time: '10 mins ago' },
    { type: 'error', message: 'Driver conflict detected for Route TR-234', time: '1 hour ago' },
    { type: 'info', message: '15 orders pending scheduling review', time: '2 hours ago' },
  ]

  return (
    <div className="manager-dashboard">
      <div className="dashboard-welcome">
        <div>
          <h1 className="page-title">Logistics Operations Dashboard</h1>
          <p className="page-subtitle">Manage scheduling, routes, and delivery operations</p>
        </div>
        <Link to="/manager/orders" className="btn-primary">
          Review Orders
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">🚂</div>
          <div className="stat-content">
            <div className="stat-label">Active Train Trips</div>
            <div className="stat-value">12</div>
            <div className="stat-change positive">+2 this week</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚛</div>
          <div className="stat-content">
            <div className="stat-label">Active Truck Routes</div>
            <div className="stat-value">28</div>
            <div className="stat-change positive">+5 today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-label">Pending Orders</div>
            <div className="stat-value">15</div>
            <div className="stat-change">Needs review</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-label">On-Time Rate</div>
            <div className="stat-value">94%</div>
            <div className="stat-change positive">+3% vs last month</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="upcoming-trips-section">
          <div className="section-header">
            <h2>Upcoming Trips & Deliveries</h2>
            <div className="header-actions-small">
              <Link to="/manager/train" className="btn-link">Train Schedule</Link>
              <Link to="/manager/truck" className="btn-link">Truck Schedule</Link>
            </div>
          </div>

          <div className="trips-table">
            <div className="table-header">
              <div className="th">Trip ID</div>
              <div className="th">Type</div>
              <div className="th">Route</div>
              <div className="th">Date</div>
              <div className="th">Capacity</div>
              <div className="th">Status</div>
            </div>
            
            {upcomingTrips.map((trip) => (
              <div key={trip.id} className="table-row">
                <div className="td td-id">{trip.id}</div>
                <div className="td">{trip.type}</div>
                <div className="td">{trip.route}</div>
                <div className="td">{trip.date}</div>
                <div className="td">
                  <div className="capacity-bar">
                    <div className="capacity-fill" style={{ width: trip.capacity }}></div>
                    <span className="capacity-text">{trip.capacity}</span>
                  </div>
                </div>
                <div className="td">
                  <span className={`badge ${trip.status === 'Near Full' ? 'badge-yellow' : 'badge-green'}`}>
                    {trip.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pending-orders-section">
          <div className="section-header">
            <h2>Pending Orders</h2>
            <Link to="/manager/orders" className="btn-link">View All</Link>
          </div>

          <div className="orders-list">
            {pendingOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span className="order-id">{order.id}</span>
                  <span className={`badge ${order.priority === 'High' ? 'badge-red' : 'badge-yellow'}`}>
                    {order.priority}
                  </span>
                </div>
                <div className="order-details">
                  <div className="detail-row">
                    <span className="detail-label">Customer:</span>
                    <span>{order.customer}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Items:</span>
                    <span>{order.items}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Deadline:</span>
                    <span>{order.deadline}</span>
                  </div>
                </div>
                <button className="btn-secondary-small">Schedule Now</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="alerts-section">
        <div className="section-header">
          <h2>System Alerts</h2>
          <button className="btn-link">Clear All</button>
        </div>

        <div className="alerts-list">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`alert-item ${alert.type}`}>
              <div className="alert-icon">
                {alert.type === 'error' && '❌'}
                {alert.type === 'warning' && '⚠️'}
                {alert.type === 'info' && 'ℹ️'}
              </div>
              <div className="alert-content">
                <div className="alert-message">{alert.message}</div>
                <div className="alert-time">{alert.time}</div>
              </div>
              <button className="btn-dismiss">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/manager/train" className="action-card">
            <div className="action-icon">🚂</div>
            <div className="action-label">Schedule Train Trip</div>
          </Link>

          <Link to="/manager/truck" className="action-card">
            <div className="action-icon">🚛</div>
            <div className="action-label">Assign Truck Route</div>
          </Link>

          <Link to="/manager/orders" className="action-card">
            <div className="action-icon">📦</div>
            <div className="action-label">Review Orders</div>
          </Link>

          <Link to="/manager/reports" className="action-card">
            <div className="action-icon">📊</div>
            <div className="action-label">View Reports</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
