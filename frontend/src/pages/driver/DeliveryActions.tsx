import { useState } from 'react'
import './DeliveryActions.css'

interface DeliveryActionsProps {
  orderId: string
  currentStatus: string
  onStatusUpdate: (newStatus: string) => void
}

function DeliveryActions({ orderId, currentStatus, onStatusUpdate }: DeliveryActionsProps) {
  const [status, setStatus] = useState(currentStatus)

  const handleUpdate = () => {
    onStatusUpdate(status)
  }

  return (
    <div className="delivery-actions">
      <h2>Update Status for Order #{orderId}</h2>
      <div className="status-options">
        <button 
          className={`status-btn ${status === 'in-transit' ? 'active' : ''}`}
          onClick={() => setStatus('in-transit')}
        >
          In Transit
        </button>
        <button 
          className={`status-btn ${status === 'delivered' ? 'active' : ''}`}
          onClick={() => setStatus('delivered')}
        >
          Delivered
        </button>
        <button 
          className={`status-btn ${status === 'failed' ? 'active' : ''}`}
          onClick={() => setStatus('failed')}
        >
          Failed
        </button>
      </div>
      <button className="btn-primary" onClick={handleUpdate}>Confirm Update</button>
    </div>
  )
}

export default DeliveryActions