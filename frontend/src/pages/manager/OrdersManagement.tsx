import { useEffect, useMemo, useState } from 'react'
import { PackageIcon } from '../../components/Icons'
import './OrdersManagement.css'
import { allocateOrderToTrain, getOrderDetails, getOrders, updateOrderStatus, type OrderDetails, type OrderSummary } from '../../lib/api'

function OrdersManagement() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [details, setDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    getOrders().then(setOrders)
  }, [])

  useEffect(() => {
    if (selectedId == null) return
    setLoading(true)
    getOrderDetails(selectedId)
      .then(setDetails)
      .finally(() => setLoading(false))
  }, [selectedId])

  const pendingOrders = useMemo(() => orders.filter(o => (o.status || '').toLowerCase() !== 'delivered'), [orders])

  async function setStatus(status: string) {
    if (selectedId == null) return
    setUpdating(true)
    try {
      await updateOrderStatus(selectedId, status)
      const refreshed = await getOrders()
      setOrders(refreshed)
      const current = refreshed.find(o => o.order_id === selectedId)
      if (!current) setSelectedId(null)
      else setSelectedId(current.order_id)
    } finally {
      setUpdating(false)
    }
  }

  async function allocateTrain() {
    if (selectedId == null) return
    setUpdating(true)
    try {
      await allocateOrderToTrain(selectedId)
      await setStatus('Scheduled')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="manager-orders-page">
      <h1 className="page-title">Orders Management</h1>
      <p className="page-subtitle manager-section-intro">Review, approve, and schedule pending orders</p>

      <div className="orders-content">
        <div className="orders-grid">
          <div className="orders-list">
            {pendingOrders.length === 0 && <p className="muted">No pending orders</p>}
            {pendingOrders.map(o => (
              <button key={o.order_id} className={`order-item ${selectedId === o.order_id ? 'active' : ''}`} onClick={() => setSelectedId(o.order_id)}>
                <span>Order #{o.order_id}</span>
                <span className="order-status">{o.status}</span>
              </button>
            ))}
          </div>

          <div className="order-details">
            {!selectedId && <div className="muted inline-hint"><PackageIcon size={20} /> Select an order to view details</div>}
            {selectedId && loading && <p className="muted">Loading…</p>}
            {selectedId && !loading && details && (
              <div>
                <div className="detail-row"><strong>Customer:</strong><span className="detail-label">{details.customer_name} · {details.customer_city}</span></div>
                <div className="detail-row"><strong>Dates:</strong><span className="detail-label">Order {details.order_date} · Schedule {details.schedule_date}</span></div>
                <div className="detail-row"><strong>Status:</strong><span className="detail-label">{details.status}</span></div>
                {details.delivery_date_time && (
                  <div className="detail-row"><strong>Delivery:</strong><span className="detail-label">{details.delivery_date_time} · {details.delivery_status}</span></div>
                )}

                <div className="actions-bar">
                  <button className="btn btn-primary" disabled={updating} onClick={() => setStatus('Scheduled')}>Approve & Schedule</button>
                  <button className="btn btn-secondary" disabled={updating} onClick={allocateTrain}>Allocate to Train</button>
                  <button className="btn btn-danger" disabled={updating} onClick={() => setStatus('Cancelled')}>Reject</button>
                </div>

                <h3 className="section-heading">Items</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.items.map(it => (
                      <tr key={`${it.product_id}`}>
                        <td>{it.product_name}</td>
                        <td>{it.quantity}</td>
                        <td>${it.unit_price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersManagement
