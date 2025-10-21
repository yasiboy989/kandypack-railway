import { useState } from 'react'
import { useWarehouse } from './WarehouseContext'
import './DispatchPreparation.css'

interface OrderItem { sku: string; name: string; qty: number }
interface Order {
  id: string
  customerName: string
  route: string
  items: number
  weightKg: number
  status: 'ready-for-dispatch' | 'prepared'
  itemsDetails: OrderItem[]
}

function DispatchPreparation() {
  const { selectedBranch, isKandy } = useWarehouse()
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD004', customerName: 'Graham Hills', route: 'North Colombo', items: 12, weightKg: 85, status: 'ready-for-dispatch',
      itemsDetails: [
        { sku: 'PR-001', name: 'Premium Rice 5kg', qty: 6 },
        { sku: 'FL-101', name: 'Organic Flour 1kg', qty: 6 },
      ],
    },
    {
      id: 'ORD005', customerName: 'Jane Doe', route: 'South Kandy', items: 5, weightKg: 40, status: 'ready-for-dispatch',
      itemsDetails: [
        { sku: 'TE-250', name: 'Tea Leaves 250g', qty: 3 },
        { sku: 'CN-050', name: 'Cinnamon Sticks 50g', qty: 2 },
      ],
    },
    {
      id: 'ORD006', customerName: 'John Smith', route: 'Galle Express', items: 8, weightKg: 62, status: 'prepared',
      itemsDetails: [
        { sku: 'PR-001', name: 'Premium Rice 5kg', qty: 4 },
        { sku: 'FL-101', name: 'Organic Flour 1kg', qty: 4 },
      ],
    },
  ])
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null)

  const handlePrepareDispatch = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'prepared' } : order
    ))
  }

  const statusLabel = (s: Order['status']) => (s === 'ready-for-dispatch' ? 'to pack' : 'packed')

  if (!isKandy) {
    return (
      <div className="dispatch-preparation">
        <div className="page-header">
          <h1>Packing (Dispatch Preparation)</h1>
        </div>
        <div style={{ padding: '0.75rem 1rem', color: 'var(--neutral-400)' }}>
          Packing orders is performed only at the Kandy branch. Selected branch: <strong>{selectedBranch}</strong>.
        </div>
      </div>
    )
  }

  return (
    <div className="dispatch-preparation">
      <div className="page-header">
        <h1>Packing (Dispatch Preparation)</h1>
        <div className="branch-chip">{selectedBranch}</div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Route</th>
              <th>Items</th>
              <th>Weight</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerName}</td>
                <td>{order.route}</td>
                <td>{order.items}</td>
                <td>{order.weightKg} kg</td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {statusLabel(order.status)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-secondary" onClick={() => setDetailsOrder(order)}>View Items</button>
                    {order.status === 'ready-for-dispatch' && (
                      <button 
                        className="btn-primary" 
                        onClick={() => handlePrepareDispatch(order.id)}
                      >
                        Mark as Packed
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailsOrder && (
        <div className="modal-overlay" onClick={() => setDetailsOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order {detailsOrder.id} Items</h2>
              <button className="modal-close" onClick={() => setDetailsOrder(null)}>×</button>
            </div>
            <div className="modal-body">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {detailsOrder.itemsDetails.map((it, idx) => (
                    <tr key={idx}>
                      <td>{it.sku}</td>
                      <td>{it.name}</td>
                      <td style={{ textAlign: 'right' }}>{it.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDetailsOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DispatchPreparation