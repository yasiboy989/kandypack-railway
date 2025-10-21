import { useMemo, useState } from 'react'
import { useWarehouse } from './WarehouseContext'
import './TruckLoading.css'

interface OrderItem { sku: string; name: string; qty: number }
interface TruckOrder {
  orderId: string
  customerName: string
  address: string
  allocatedSpace?: number
  items: OrderItem[]
  loaded: boolean
  truckId: string
}
interface TruckSummary {
  truckId: string
  route: string
  ordersCount: number
  loadedCount: number
  totalAllocated?: number
}

export default function TruckLoading() {
  const { selectedBranch } = useWarehouse()
  // Mock data: replace with API wired by branch
  const [orders, setOrders] = useState<TruckOrder[]>([
    {
      orderId: 'ORD3001', customerName: 'BlueMart', address: '12 Park St, Colombo', truckId: 'TRK-01', allocatedSpace: 120, loaded: false,
      items: [ { sku: 'PR-001', name: 'Premium Rice 5kg', qty: 8 }, { sku: 'FL-101', name: 'Organic Flour 1kg', qty: 12 } ],
    },
    {
      orderId: 'ORD3002', customerName: 'City Grocer', address: '88 Queen Rd, Colombo', truckId: 'TRK-01', allocatedSpace: 60, loaded: true,
      items: [ { sku: 'TE-250', name: 'Tea Leaves 250g', qty: 15 } ],
    },
    {
      orderId: 'ORD3003', customerName: 'GreenLeaf', address: '7 Lake Dr, Colombo', truckId: 'TRK-02', allocatedSpace: 80, loaded: false,
      items: [ { sku: 'CN-050', name: 'Cinnamon Sticks 50g', qty: 20 } ],
    },
  ])
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null)
  const [detailsOrder, setDetailsOrder] = useState<TruckOrder | null>(null)

  const truckSummaries = useMemo<TruckSummary[]>(() => {
    const map = new Map<string, TruckSummary>()
    for (const o of orders) {
      const t = o.truckId
      const entry = map.get(t) ?? { truckId: t, route: `${selectedBranch} Local`, ordersCount: 0, loadedCount: 0, totalAllocated: 0 }
      entry.ordersCount += 1
      entry.loadedCount += o.loaded ? 1 : 0
      entry.totalAllocated = (entry.totalAllocated ?? 0) + (o.allocatedSpace ?? 0)
      map.set(t, entry)
    }
    return Array.from(map.values())
  }, [orders, selectedBranch])

  const currentTruckOrders = useMemo(() => orders.filter(o => o.truckId === selectedTruckId), [orders, selectedTruckId])
  const allCurrentLoaded = useMemo(() => currentTruckOrders.length > 0 && currentTruckOrders.every(o => o.loaded), [currentTruckOrders])

  return (
    <div className="truck-loading">
      <div className="page-header">
        <h1>Truck Loading</h1>
        <div className="branch-chip">{selectedBranch}</div>
      </div>

      {!selectedTruckId && (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Truck</th>
                <th>Route</th>
                <th>Orders</th>
                <th>Allocated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {truckSummaries.map((t) => {
                const ready = t.loadedCount === t.ordersCount && t.ordersCount > 0
                return (
                  <tr key={t.truckId}>
                    <td>{t.truckId}</td>
                    <td>{t.route}</td>
                    <td>{t.loadedCount}/{t.ordersCount}</td>
                    <td>{t.totalAllocated ? `${t.totalAllocated} kg` : '-'}</td>
                    <td>
                      <span className={`status-badge ${ready ? 'delivered' : 'pending'}`}>
                        {ready ? 'Ready to Depart' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-primary" onClick={() => setSelectedTruckId(t.truckId)}>Open</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedTruckId && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setSelectedTruckId(null)}>← Trucks</button>
              <h2 style={{ margin: 0 }}>Truck {selectedTruckId} Orders</h2>
            </div>
            <button
              className="btn-success"
              disabled={!allCurrentLoaded}
              title={allCurrentLoaded ? 'Mark this truck as loaded' : 'Confirm all orders first'}
              onClick={() => {/* integrate API here; UI only */}}
            >
              Mark Truck Loaded
            </button>
          </div>

          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Allocated</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTruckOrders.map((o) => (
                  <tr key={o.orderId}>
                    <td>{o.orderId}</td>
                    <td>{o.customerName}</td>
                    <td>{o.address}</td>
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
