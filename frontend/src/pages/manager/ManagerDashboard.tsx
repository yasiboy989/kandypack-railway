import { Link } from 'react-router-dom'
import './ManagerDashboard.css'
import { TrainIcon, TruckIcon, PackageIcon, CheckIcon, ReportsIcon } from '../../components/Icons'
import { useEffect, useState } from 'react'
import { getManagerDashboardStats, type ManagerDashboardStats } from '../../lib/api'

function ManagerDashboard() {
  const [stats, setStats] = useState<ManagerDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getManagerDashboardStats()
      .then((data) => {
        if (!mounted) return
        setStats(data)
      })
      .catch((err) => {
        console.error('Failed to load manager dashboard stats:', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    
    return () => {
      mounted = false
    }
  }, [])

  const alerts = [
    { type: 'warning', message: 'Train capacity near limit - consider overflow planning', time: '10 mins ago' },
    { type: 'error', message: 'Driver conflict detected for Route TR-234', time: '1 hour ago' },
    { type: 'info', message: `${stats?.pending_orders || 0} orders pending scheduling review`, time: '2 hours ago' },
  ]

  if (loading) {
    return (
      <div className="manager-dashboard">
        <div style={{ padding: '24px', textAlign: 'center' }}>Loading dashboard...</div>
      </div>
    )
  }

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
          <div className="stat-icon">
            <TrainIcon size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Train Trips</div>
            <div className="stat-value">{stats?.active_train_trips || 0}</div>
            <div className="stat-change positive">+2 this week</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TruckIcon size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Truck Routes</div>
            <div className="stat-value">{stats?.active_truck_routes || 0}</div>
            <div className="stat-change positive">+5 today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <PackageIcon size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Pending Orders</div>
            <div className="stat-value">{stats?.pending_orders || 0}</div>
            <div className="stat-change">Needs review</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckIcon size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">On-Time Rate</div>
            <div className="stat-value">{stats?.on_time_rate || 0}%</div>
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
            
            {stats?.upcoming_trips.map((trip) => (
              <div key={trip.id} className="table-row">
                <div className="td td-id">{trip.id}</div>
                <div className="td">Train</div>
                <div className="td">{trip.route}</div>
                <div className="td">{trip.date}</div>
                <div className="td">
                  <div className="capacity-bar">
                    <div className="capacity-fill" style={{ width: trip.capacity }}></div>
                    <span className="capacity-text">{trip.capacity}</span>
                  </div>
                </div>
                <div className="td">
                  <span className={`badge ${parseFloat(trip.capacity) > 90 ? 'badge-yellow' : 'badge-green'}`}>
                    {parseFloat(trip.capacity) > 90 ? 'Near Full' : 'On Schedule'}
                  </span>
                </div>
              </div>
            )) || []}
          </div>
        </div>

        <div className="pending-orders-section">
          <div className="section-header">
            <h2>Pending Orders</h2>
            <Link to="/manager/orders" className="btn-link">View All</Link>
          </div>

          <div className="orders-list">
            {stats?.pending_orders_details.map((order) => (
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
            )) || []}
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
            <div className="action-icon">
              <TrainIcon size={32} />
            </div>
            <div className="action-label">Schedule Train Trip</div>
          </Link>

          <Link to="/manager/truck" className="action-card">
            <div className="action-icon">
              <TruckIcon size={32} />
            </div>
            <div className="action-label">Assign Truck Route</div>
          </Link>

          <Link to="/manager/orders" className="action-card">
            <div className="action-icon">
              <PackageIcon size={32} />
            </div>
            <div className="action-label">Review Orders</div>
          </Link>

          <Link to="/manager/reports" className="action-card">
            <div className="action-icon">
              <ReportsIcon size={32} />
            </div>
            <div className="action-label">View Reports</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
