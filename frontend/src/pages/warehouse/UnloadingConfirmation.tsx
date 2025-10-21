import { useState } from 'react'
import { useWarehouse } from './WarehouseContext'
import './UnloadingConfirmation.css'

interface TrainTrip {
  id: string
  origin: string
  destination: string
  arrivalTime: string
  status: 'arrived' | 'unloaded'
}
interface TripOrder { orderId: string; customerName: string; weightKg: number; unloaded?: boolean }

function UnloadingConfirmation() {
  const { selectedBranch } = useWarehouse()
  const [trainTrips, setTrainTrips] = useState<TrainTrip[]>([
    { id: 'TT001', origin: 'Kandy', destination: 'Colombo', arrivalTime: '10:30', status: 'arrived' },
    { id: 'TT002', origin: 'Colombo', destination: 'Galle', arrivalTime: '14:00', status: 'arrived' },
    { id: 'TT003', origin: 'Galle', destination: 'Colombo', arrivalTime: '16:00', status: 'unloaded' },
  ])
  // Mock orders per trip; replace with API when available. Keep in state for proper updates
  const [ordersByTrip, setOrdersByTrip] = useState<Record<string, TripOrder[]>>({
    TT001: [
      { orderId: 'ORD2001', customerName: 'BlueMart', weightKg: 55, unloaded: false },
      { orderId: 'ORD2002', customerName: 'Hill Foods', weightKg: 40, unloaded: false },
      { orderId: 'ORD2003', customerName: 'Seaside Stores', weightKg: 25, unloaded: false },
    ],
    TT002: [
      { orderId: 'ORD2011', customerName: 'FreshCo', weightKg: 30, unloaded: false },
      { orderId: 'ORD2012', customerName: 'City Grocer', weightKg: 75, unloaded: false },
    ],
    TT003: [
      { orderId: 'ORD2021', customerName: 'GreenLeaf', weightKg: 20, unloaded: true },
    ],
  })
  const [openTripId, setOpenTripId] = useState<string | null>(null)
  const openTripOrders = openTripId ? (ordersByTrip[openTripId] || []) : []
  const canMarkTripUnloaded = openTripOrders.length > 0 && openTripOrders.every(o => o.unloaded)

  const handleConfirmUnloading = (tripId: string) => {
    setTrainTrips(trainTrips.map(trip => 
      trip.id === tripId ? { ...trip, status: 'unloaded' } : trip
    ))
  }

  return (
    <div className="unloading-confirmation">
      <div className="page-header">
        <h1>Unloading Confirmation</h1>
        <div className="branch-chip">{selectedBranch}</div>
      </div>

      {!openTripId && (
        <div className="trips-table-container">
          <table className="trips-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Arrival Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainTrips.filter(t => t.destination === selectedBranch).map((trip) => (
                <tr key={trip.id}>
                  <td>{trip.id}</td>
                  <td>{trip.origin}</td>
                  <td>{trip.destination}</td>
                  <td>{trip.arrivalTime}</td>
                  <td>
                    <span className={`status-badge ${trip.status}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-primary" onClick={() => setOpenTripId(trip.id)}>Open</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openTripId && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setOpenTripId(null)}>← Trips</button>
              <h2 style={{ margin: 0 }}>Trip {openTripId} Orders</h2>
            </div>
            <button
              className="btn-success"
              disabled={!canMarkTripUnloaded}
              title={canMarkTripUnloaded ? 'Mark trip unloaded' : 'Confirm all orders first'}
              onClick={() => handleConfirmUnloading(openTripId)}
            >
              Mark Trip Unloaded
            </button>
          </div>

          <div className="trips-table-container">
            <table className="trips-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Weight (kg)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {openTripOrders.map((o) => (
                  <tr key={o.orderId}>
                    <td>{o.orderId}</td>
                    <td>{o.customerName}</td>
                    <td style={{ textAlign: 'right' }}>{o.weightKg}</td>
                    <td>
                      <span className={`status-badge ${o.unloaded ? 'unloaded' : 'arrived'}`}>
                        {o.unloaded ? 'Unloaded' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!o.unloaded && (
                        <button className="btn-primary" onClick={() => {
                          if (!openTripId) return
                          setOrdersByTrip(prev => ({
                            ...prev,
                            [openTripId]: (prev[openTripId] || []).map(x => x.orderId === o.orderId ? { ...x, unloaded: true } : x)
                          }))
                        }}>Confirm Unloaded</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  )
}

export default UnloadingConfirmation