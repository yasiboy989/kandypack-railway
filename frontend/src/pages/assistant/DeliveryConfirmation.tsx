import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import apiFetch from '../../utils/api'
import './DeliveryConfirmation.css'

interface DeliveryRow {
  delivery_id: number | string
  route_name?: string
  route_start?: string
  route_end?: string
  truck_plate?: string
  status?: string
}

function DeliveryConfirmation() {
  const [searchParams] = useSearchParams()
  const deliveryId = searchParams.get('deliveryId')
  const [delivery, setDelivery] = useState<DeliveryRow | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      try {
        if (!deliveryId) return
        // There is no single-delivery endpoint in backend; fetch all and pick one
        const res = await apiFetch('/deliveries/deliveries')
        if (!res.ok) throw new Error('Failed to fetch deliveries')
        const list = await res.json()
        const found = (list || []).find((d: any) => String(d.delivery_id ?? d.id ?? d[0]) === String(deliveryId))
        setDelivery(found || null)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    if (deliveryId) {
      fetchDeliveryDetails()
    }
  }, [deliveryId])

  const handleConfirm = async () => {
    try {
      if (!deliveryId) return
      const res = await apiFetch(`/deliveries/${deliveryId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered', notes }),
      })
      if (!res.ok) throw new Error('Failed to confirm delivery')
      navigate('/assistant')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!delivery) return <div>Delivery not found</div>

  return (
    <div className="delivery-confirmation">
      <div className="page-header">
        <h1>Confirm Delivery</h1>
        <p>Delivery ID: {deliveryId}</p>
      </div>

      <div className="confirmation-card">
        <div className="card-body">
          <div className="detail-item">
            <div className="detail-label">Route</div>
            <div className="detail-value">{delivery.route_name || `${delivery.route_start ?? ''} → ${delivery.route_end ?? ''}`}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Truck</div>
            <div className="detail-value">{delivery.truck_plate || '-'}</div>
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
