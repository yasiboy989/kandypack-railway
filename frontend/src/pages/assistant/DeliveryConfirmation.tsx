import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import './DeliveryConfirmation.css'

function DeliveryConfirmation() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [notes, setNotes] = useState('')

  const delivery = {
    customerName: 'Graham Hills',
    address: '123, Main Street, Colombo 07',
  }

  const handleConfirm = () => {
    // Handle confirmation logic here
    alert(`Delivery for order ${orderId} confirmed!`)
  }

  return (
    <div className="delivery-confirmation">
      <div className="page-header">
        <h1>Confirm Delivery</h1>
        <p>Order ID: {orderId}</p>
      </div>

      <div className="confirmation-card">
        <div className="card-body">
          <div className="detail-item">
            <div className="detail-label">Customer</div>
            <div className="detail-value">{delivery.customerName}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Address</div>
            <div className="detail-value">{delivery.address}</div>
          </div>
          <div className="notes-section">
            <label htmlFor="notes">Add Notes (Optional)</label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., package left with security"
            ></textarea>
          </div>
        </div>
        <div className="card-actions">
          <button className="btn-primary" onClick={handleConfirm}>
            Confirm Delivery
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeliveryConfirmation
