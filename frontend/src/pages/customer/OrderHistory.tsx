import { useState } from 'react'
import './OrderHistory.css'

function OrderHistory() {
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const orders = [
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
    {
      id: '#1533',
      date: '2024-12-20',
      deliveryDate: '2024-12-28',
      status: 'Delivered',
      items: 7,
      total: '$389.50',
    },
    {
      id: '#1532',
      date: '2024-12-15',
      deliveryDate: '2024-12-23',
      status: 'Delivered',
      items: 4,
      total: '$198.25',
    },
    {
      id: '#1531',
      date: '2024-12-10',
      deliveryDate: '2024-12-18',
      status: 'Delivered',
      items: 6,
      total: '$412.90',
    },
    {
      id: '#1530',
      date: '2024-12-05',
      deliveryDate: '2024-12-13',
      status: 'Delivered',
      items: 2,
      total: '$89.40',
    },
  ]

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'In Transit', label: 'In Transit', count: orders.filter(o => o.status === 'In Transit').length },
    { value: 'Scheduled', label: 'Scheduled', count: orders.filter(o => o.status === 'Scheduled').length },
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
          {filteredOrders.map((order) => (
            <div key={order.id} className="table-row">
              <div className="td td-id">
                <span className="order-id-link">{order.id}</span>
              </div>
              <div className="td td-date">{order.date}</div>
              <div className="td td-delivery">{order.deliveryDate}</div>
              <div className="td td-status">
                <span className={`badge ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="td td-items">{order.items} items</div>
              <div className="td td-total">
                <span className="total-amount">{order.total}</span>
              </div>
              <div className="td td-actions">
                <button
                  className="btn-action"
                  onClick={() => downloadInvoice(order.id)}
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
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
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
