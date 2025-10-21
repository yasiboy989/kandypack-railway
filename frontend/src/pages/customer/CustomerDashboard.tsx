import { Link } from 'react-router-dom'
import './CustomerDashboard.css'

function CustomerDashboard() {
  const currentOrders = [
    {
      id: '#1535',
      date: '2024-12-28',
      deliveryDate: '2025-01-05',
      status: 'In Transit',
      items: 5,
      total: '$245.80',
    },
    {
      id: '#1534',
      date: '2024-12-25',
      deliveryDate: '2025-01-02',
      status: 'Scheduled',
      items: 3,
      total: '$156.40',
    },
  ]

  const notifications = [
    {
      type: 'info',
      message: 'Order #1535 is now in transit. Expected delivery: Jan 5, 2025',
      time: '2 hours ago',
    },
    {
      type: 'success',
      message: 'Order #1534 has been scheduled for delivery on Jan 2, 2025',
      time: '1 day ago',
    },
    {
      type: 'info',
      message: 'Your delivery window for Order #1535 is 9:00 AM - 5:00 PM',
      time: '2 days ago',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit': return 'badge-yellow'
      case 'Scheduled': return 'badge-green'
      case 'Delivered': return 'badge-blue'
      default: return ''
    }
  }

  return (
    <div className="customer-dashboard">
      <div className="dashboard-welcome">
        <div>
          <h1 className="page-title">Welcome back, Emma!</h1>
          <p className="page-subtitle">Track your orders and manage your account</p>
        </div>
        <Link to="/customer/new-order" className="btn-primary">
          Place New Order →
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-label">Active Orders</div>
            <div className="stat-value">2</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-label">Delivered This Year</div>
            <div className="stat-value">18</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">$4,289</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="current-orders-section">
          <div className="section-header">
            <h2>Current Orders</h2>
            <Link to="/customer/history" className="btn-link">View All</Link>
          </div>

          <div className="orders-list">
            {currentOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">{order.id}</div>
                  <span className={`badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="detail-label">Order Date:</span>
                    <span className="detail-value">{order.date}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Delivery Date:</span>
                    <span className="detail-value">{order.deliveryDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Items:</span>
                    <span className="detail-value">{order.items}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total:</span>
                    <span className="detail-value detail-total">{order.total}</span>
                  </div>
                </div>

                <div className="order-actions">
                  <button className="btn-secondary-small">Track Order</button>
                  <button className="btn-link-small">View Details</button>
                </div>
              </div>
            ))}
          </div>

          {currentOrders.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <p>No active orders</p>
              <Link to="/customer/new-order" className="btn-primary">
                Place Your First Order
              </Link>
            </div>
          )}
        </div>

        <div className="notifications-section">
          <div className="section-header">
            <h2>Notifications</h2>
            <button className="btn-link">Mark All Read</button>
          </div>

          <div className="notifications-list">
            {notifications.map((notif, idx) => (
              <div key={idx} className={`notification-item ${notif.type}`}>
                <div className="notif-icon">
                  {notif.type === 'info' && 'ℹ️'}
                  {notif.type === 'success' && '✓'}
                  {notif.type === 'warning' && '⚠️'}
                </div>
                <div className="notif-content">
                  <div className="notif-message">{notif.message}</div>
                  <div className="notif-time">{notif.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/customer/new-order" className="action-card">
            <div className="action-icon">➕</div>
            <div className="action-label">Place New Order</div>
          </Link>

          <Link to="/customer/history" className="action-card">
            <div className="action-icon">📜</div>
            <div className="action-label">Order History</div>
          </Link>

          <Link to="/customer/settings" className="action-card">
            <div className="action-icon">⚙️</div>
            <div className="action-label">Account Settings</div>
          </Link>

          <a href="#support" className="action-card">
            <div className="action-icon">💬</div>
            <div className="action-label">Contact Support</div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
