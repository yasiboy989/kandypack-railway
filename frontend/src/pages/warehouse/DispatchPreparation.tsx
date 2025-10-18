import { useState } from 'react'
import './DispatchPreparation.css'

interface Order {
  id: string
  customerName: string
  route: string
  status: 'ready-for-dispatch' | 'prepared'
}

function DispatchPreparation() {
  const [orders, setOrders] = useState<Order[]>([
    { id: 'ORD004', customerName: 'Graham Hills', route: 'North Colombo', status: 'ready-for-dispatch' },
    { id: 'ORD005', customerName: 'Jane Doe', route: 'South Kandy', status: 'ready-for-dispatch' },
    { id: 'ORD006', customerName: 'John Smith', route: 'Galle Express', status: 'prepared' },
  ])

  const handlePrepareDispatch = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'prepared' } : order
    ))
  }

  return (
    <div className="dispatch-preparation">
      <div className="page-header">
        <h1>Dispatch Preparation</h1>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Route</th>
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
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status.replace('-', ' ')}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {order.status === 'ready-for-dispatch' && (
                      <button 
                        className="btn-primary" 
                        onClick={() => handlePrepareDispatch(order.id)}
                      >
                        Mark as Prepared
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DispatchPreparation