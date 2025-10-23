import { useEffect, useState } from 'react'
import './OrderHistory.css'
import { PackageIcon } from '../../components/Icons'
import { getCustomerDashboardStats, type CustomerDashboardStats } from '../../lib/api'

interface Order {
  order_id: number
  status: string
  order_date: string
  delivery_date: string
}

function OrderHistory() {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getCustomerDashboardStats()
      .then((data: CustomerDashboardStats) => {
        if (!mounted) return
        setOrders(data.recent_orders)
      })
      .catch((err) => {
        console.error('Failed to load orders:', err)
        if (mounted) setOrders([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'In Transit', label: 'In Transit', count: orders.filter(o => o.status === 'In Transit').length },
    { value: 'Scheduled', label: 'Scheduled', count: orders.filter(o => o.status === 'Scheduled').length },
    { value: 'Pending', label: 'Pending', count: orders.filter(o => o.status === 'Pending').length },
    { value: 'Delivered', label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length },
  ]

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit': return 'badge-yellow'
      case 'Scheduled': return 'badge-green'
      case 'Delivered': return 'badge-blue'
      default: return ''
    }
  }

  const downloadInvoice = (orderId: string) => {
    console.log('Downloading invoice for', orderId)
    alert(`Downloading invoice for order ${orderId}...`)
  }

  return (
    <div className="order-history">
      <div className="history-header">
        <div>
          <h1 className="page-title">Order History</h1>
          <p className="page-subtitle">View all your past and current orders</p>
        </div>
        <button className="btn-secondary">
          Export All
        </button>
      </div>

      <div className="filter-section">
        <div className="filter-tabs">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={`filter-tab ${filterStatus === option.value ? 'active' : ''}`}
              onClick={() => setFilterStatus(option.value)}
            >
              {option.label}
              <span className="tab-count">{option.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="orders-table">
        <div className="table-header">
          <div className="th th-id">Order ID</div>
          <div className="th th-date">Order Date</div>
          <div className="th th-delivery">Delivery Date</div>
          <div className="th th-status">Status</div>
          <div className="th th-items">Items</div>
          <div className="th th-total">Total</div>
          <div className="th th-actions">Actions</div>
        </div>

        <div className="table-body">
          {filteredOrders.length > 0 ? filteredOrders.map((order) => (
            <div key={order.order_id} className="table-row">
              <div className="td td-id">
                <span className="order-id-link">#{order.order_id}</span>
              </div>
              <div className="td td-date">{order.order_date}</div>
              <div className="td td-delivery">{order.delivery_date}</div>
              <div className="td td-status">
                <span className={`badge ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="td td-items">-</div>
              <div className="td td-total">
                <span className="total-amount">-</span>
              </div>
              <div className="td td-actions">
                <button
                  className="btn-action"
                  onClick={() => downloadInvoice(`#${order.order_id}`)}
                  title="Download Invoice"
                >
                  ⬇️
                </button>
                {order.status !== 'Delivered' && (
                  <button className="btn-action" title="Track Order">
                    📍
                  </button>
                )}
                <button className="btn-action" title="View Details">
                  👁️
                </button>
              </div>
            </div>
          )) : (
            <div className="table-row empty-row">
              <div style={{ padding: '24px', textAlign: 'center', gridColumn: '1 / -1' }}>
                {loading ? 'Loading orders...' : 'No orders found'}
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <PackageIcon size={48} />
          </div>
          <p>No orders found</p>
        </div>
      )}

      <div className="history-footer">
        <div className="pagination">
          <button className="btn-page" disabled>
            ← Previous
          </button>
          <div className="page-info">
            Page 1 of 1
          </div>
          <button className="btn-page" disabled>
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderHistory
