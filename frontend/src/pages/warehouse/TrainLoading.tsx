import { useMemo, useState } from 'react'
import { useWarehouse } from './WarehouseContext'
import './TrainLoading.css'

interface OrderItem { sku: string; name: string; qty: number }
interface LoadOrder {
  orderId: string
  customerName: string
  destinationBranch: string
  allocatedTripId?: string
  allocatedSpace?: number
  items: OrderItem[]
  loaded: boolean
}
interface TripSummary {
  tripId: string
  destinations: string[]
  ordersCount: number
  loadedCount: number
  totalAllocated?: number
}

function TrainLoading() {
  const { isKandy, selectedBranch } = useWarehouse()
  const [orders, setOrders] = useState<LoadOrder[]>([
    {
      orderId: 'ORD1001', customerName: 'Acme Retail', destinationBranch: 'Colombo', allocatedTripId: 'TT-901', allocatedSpace: 120, loaded: false,
      items: [
        { sku: 'PR-001', name: 'Premium Rice 5kg', qty: 10 },
        { sku: 'FL-101', name: 'Organic Flour 1kg', qty: 20 },
      ],
    },
    {
      orderId: 'ORD1002', customerName: 'Hill Foods', destinationBranch: 'Galle', allocatedTripId: 'TT-902', allocatedSpace: 80, loaded: false,
      items: [
        { sku: 'TE-250', name: 'Tea Leaves 250g', qty: 30 },
        { sku: 'CN-050', name: 'Cinnamon Sticks 50g', qty: 40 },
      ],
    },
    {
      orderId: 'ORD1003', customerName: 'CozyMart', destinationBranch: 'Colombo', allocatedTripId: 'TT-901', allocatedSpace: 60, loaded: true,
      items: [
        { sku: 'PR-001', name: 'Premium Rice 5kg', qty: 5 },
      ],
    },
  ])
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [detailsOrder, setDetailsOrder] = useState<LoadOrder | null>(null)

  const tripSummaries = useMemo<TripSummary[]>(() => {
    const map = new Map<string, TripSummary>()
    for (const o of orders) {
      const t = o.allocatedTripId
      if (!t) continue
      const entry = map.get(t) ?? { tripId: t, destinations: [], ordersCount: 0, loadedCount: 0, totalAllocated: 0 }
      if (!entry.destinations.includes(o.destinationBranch)) entry.destinations.push(o.destinationBranch)
      entry.ordersCount += 1
      entry.loadedCount += o.loaded ? 1 : 0
      entry.totalAllocated = (entry.totalAllocated ?? 0) + (o.allocatedSpace ?? 0)
      map.set(t, entry)
    }
    return Array.from(map.values())
  }, [orders])

  const currentTripOrders = useMemo(() => orders.filter(o => o.allocatedTripId === selectedTripId), [orders, selectedTripId])
  const allCurrentLoaded = useMemo(() => currentTripOrders.length > 0 && currentTripOrders.every(o => o.loaded), [currentTripOrders])

  if (!isKandy) {
    return (
      <div className="train-loading">
        <div className="page-header">
          <h1>Train Loading</h1>
        </div>
        <div style={{ padding: '0.75rem 1rem', color: 'var(--neutral-400)' }}>
          Train loading is only performed at the Kandy branch. Selected branch: <strong>{selectedBranch}</strong>.
        </div>
      </div>
    )
  }

  return (
    <div className="train-loading">
      <div className="page-header">
        <h1>Train Loading</h1>
        <div className="branch-chip">{selectedBranch}</div>
      </div>

      {!selectedTripId && (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Destinations</th>
                <th>Orders</th>
                <th>Allocated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tripSummaries.map((t) => {
                const statusLoaded = t.loadedCount === t.ordersCount && t.ordersCount > 0
                return (
                  <tr key={t.tripId}>
                    <td>{t.tripId}</td>
                    <td>{t.destinations.join(', ')}</td>
                    <td>{t.loadedCount}/{t.ordersCount}</td>
                    <td>{t.totalAllocated ? `${t.totalAllocated} kg` : '-'}</td>
                    <td>
                      <span className={`status-badge ${statusLoaded ? 'delivered' : 'pending'}`}>
                        {statusLoaded ? 'Ready to Depart' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-primary" onClick={() => setSelectedTripId(t.tripId)}>Open</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedTripId && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setSelectedTripId(null)}>← Trips</button>
              <h2 style={{ margin: 0 }}>Trip {selectedTripId} Orders</h2>
            </div>
            <button
              className="btn-success"
              disabled={!allCurrentLoaded}
              title={allCurrentLoaded ? 'Mark this trip as loaded' : 'Confirm all orders first'}
              onClick={() => {/* integrate API here; UI only for now */}}
            >
              Mark Trip Loaded
            </button>
          </div>

          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Destination Branch</th>
                  <th>Allocated</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTripOrders.map((o) => (
                  <tr key={o.orderId}>
                    <td>{o.orderId}</td>
                    <td>{o.customerName}</td>
                    <td>{o.destinationBranch}</td>
                    <td>{o.allocatedSpace ? `${o.allocatedSpace} kg` : '-'}</td>
                    <td>
                      <span className={`status-badge ${o.loaded ? 'delivered' : 'pending'}`}>
                        {o.loaded ? 'Loaded' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-secondary" onClick={() => setDetailsOrder(o)}>View Details</button>
                        {!o.loaded && (
                          <button
                            className="btn-primary"
                            onClick={() => setOrders((prev) => prev.map((x) => x.orderId === o.orderId ? { ...x, loaded: true } : x))}
                          >
                            Confirm Loaded
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {detailsOrder && (
        <div className="modal-overlay" onClick={() => setDetailsOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order {detailsOrder.orderId} Items</h2>
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
                  {detailsOrder.items.map((it, idx) => (
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

export default TrainLoading
