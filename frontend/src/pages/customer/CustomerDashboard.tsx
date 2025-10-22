import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './CustomerDashboard.css'
import { getOrders, type OrderSummary } from '../../lib/api'

function CustomerDashboard() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getOrders()
      .then((list) => {
        if (!mounted) return
        setOrders(list)
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered').length

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
          <h1 className="page-title">Welcome back</h1>
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
            <div className="stat-value">{loading ? '…' : activeOrdersCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-label">Delivered This Year</div>
            <div className="stat-value">{loading ? '…' : orders.filter(o => o.status === 'Delivered').length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{loading ? '…' : orders.length}</div>
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
            {orders.map((order) => (
              <div key={order.order_id} className="order-card">
                <div className="order-header">
                  <div className="order-id">#{order.order_id}</div>
                  <span className={`badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="detail-label">Order ID</span>
                    <span className="detail-value">#{order.order_id}</span>
                  </div>
                </div>

                <div className="order-actions">
                  <button className="btn-secondary-small">Track Order</button>
                  <button className="btn-link-small">View Details</button>
                </div>
              </div>
            ))}
          </div>

          {!loading && orders.length === 0 && (
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
            {!loading && orders.length === 0 ? (
              <div className="empty-state">
                <p>No notifications</p>
              </div>
            ) : (
              <div className="empty-state">
                <p>Notifications are available via real-time updates</p>
              </div>
            )}
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
