import { useState } from 'react'
import './MyDeliveries.css'

interface Delivery {
  id: string
  customerName: string
  address: string
  status: 'pending' | 'in-transit' | 'delivered' | 'failed'
}

function MyDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    { id: 'ORD004', customerName: 'Graham Hills', address: '123, Main Street, Colombo 07', status: 'in-transit' },
    { id: 'ORD005', customerName: 'Jane Doe', address: '456, Galle Road, Colombo 03', status: 'pending' },
    { id: 'ORD002', customerName: 'Sophie Moore', address: '789, Kandy Road, Kiribathgoda', status: 'delivered' },
    { id: 'ORD001', customerName: 'John Carter', address: '321, High Level Road, Nugegoda', status: 'failed' },
  ])

  return (
    <div className="my-deliveries">
      <div className="page-header">
        <h1>My Deliveries</h1>
      </div>

      <div className="deliveries-list">
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="delivery-card">
            <div className="card-header">
              <h3>{delivery.customerName}</h3>
              <span className={`status-badge ${delivery.status}`}>
                {delivery.status}
              </span>
            </div>
            <div className="card-body">
              <p className="address">{delivery.address}</p>
            </div>
            <div className="card-actions">
              <button className="btn-primary">Update Status</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyDeliveries