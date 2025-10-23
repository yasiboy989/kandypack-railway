import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './CustomerDashboard.css'
import { getCustomerDashboardStats, type CustomerDashboardStats } from '../../lib/api'
import { PackageIcon, CheckIcon, PlusIcon, OrderHistoryIcon, SupportIcon } from '../../components/Icons'

function CustomerDashboard() {
  const [stats, setStats] = useState<CustomerDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getCustomerDashboardStats()
      .then((data) => {
        if (!mounted) return
        setStats(data)
      })
      .catch((err) => {
        console.error('Failed to load customer dashboard stats:', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    
    return () => {
      mounted = false
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit': return 'badge-yellow'
      case 'Scheduled': return 'badge-green'
      case 'Delivered': return 'badge-blue'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="customer-dashboard">
        <div style={{ padding: '24px', textAlign: 'center' }}>Loading dashboard...</div>
      </div>
    )
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
          <div className="stat-icon">
            <PackageIcon size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats?.total_orders || 0}</div>
            <div className="stat-change">All time</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckIcon size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Orders</div>
            <div className="stat-value">{stats?.active_orders || 0}</div>
            <div className="stat-change">In progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <OrderHistoryIcon size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Delivered</div>
            <div className="stat-value">{(stats?.total_orders || 0) - (stats?.active_orders || 0)}</div>
            <div className="stat-change">Completed</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="recent-orders-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/customer/history" className="btn-link">View All</Link>
          </div>

          <div className="orders-list">
            {stats?.recent_orders.length ? (
              stats.recent_orders.map((order) => (
                <div key={order.order_id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">#{order.order_id}</span>
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">Order Date:</span>
                      <span>{new Date(order.order_date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Delivery Date:</span>
                      <span>{new Date(order.delivery_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="order-actions">
                    <Link to={`/customer/orders/${order.order_id}`} className="btn-secondary-small">
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <PackageIcon size={48} />
                </div>
                <p>No orders yet</p>
                <Link to="/customer/new-order" className="btn-primary">
                  Place Your First Order
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/customer/new-order" className="action-card">
              <div className="action-icon">
                <PlusIcon size={32} />
              </div>
              <div className="action-label">Place New Order</div>
            </Link>

            <Link to="/customer/history" className="action-card">
              <div className="action-icon">
                <OrderHistoryIcon size={32} />
              </div>
              <div className="action-label">Order History</div>
            </Link>

            <Link to="/customer/support" className="action-card">
              <div className="action-icon">
                <SupportIcon size={32} />
              </div>
              <div className="action-label">Support</div>
            </Link>
          </div>
        </div>
      </div>

      <div className="help-section">
        <h2>Need Help?</h2>
        <div className="help-content">
          <div className="help-item">
            <h3>📞 Contact Support</h3>
            <p>Get help with your orders or account</p>
            <Link to="/customer/support" className="btn-link">Contact Us</Link>
          </div>
          <div className="help-item">
            <h3>📋 Order Guidelines</h3>
            <p>Minimum 7 days lead time required for all orders</p>
            <Link to="/customer/guidelines" className="btn-link">Learn More</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
