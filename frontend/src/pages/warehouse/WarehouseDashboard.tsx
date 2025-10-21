import './WarehouseDashboard.css'
import { useEffect, useMemo, useState } from 'react'
import { useWarehouse } from './WarehouseContext'
import apiFetch from '../../utils/api'

function WarehouseDashboard() {
  const { selectedBranch } = useWarehouse()
  const [incomingTrips, setIncomingTrips] = useState<number>(0)
  const [dispatchesReady, setDispatchesReady] = useState<number>(0)
  const [itemsToStock, setItemsToStock] = useState<number>(0)
  const [lowStock, setLowStock] = useState<number>(0)
  const [recentActivities, setRecentActivities] = useState<{ message: string; time: string }[]>([])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        // Replace with real endpoints; using mocks for now
        const invRes = await apiFetch('/api/inventory')
        const inv = await invRes.json()
        if (!active) return
        const low = inv.filter((p: any) => p.stock > 0 && p.stock < 20).length
        const toStock = inv.filter((p: any) => p.stock === 0).length
        setLowStock(low)
        setItemsToStock(toStock)
      } catch {}
      // Simulated counts for now
      if (!active) return
      setIncomingTrips(2)
      setDispatchesReady(3)
      setRecentActivities([
        { message: `${selectedBranch} — Train trip TT-901 unloaded`, time: '35 mins ago' },
        { message: `${selectedBranch} — Truck TRK-01 marked loaded`, time: '1 hour ago' },
        { message: `${selectedBranch} — Inventory updated for PROD002`, time: '2 hours ago' },
      ])
    })()
    return () => { active = false }
  }, [selectedBranch])

  const stats = useMemo(() => ([
    { label: 'Incoming Shipments', value: String(incomingTrips), icon: '🚂', href: '/warehouse/unloading' },
    { label: 'Outgoing Dispatches', value: String(dispatchesReady), icon: '🚛', href: '/warehouse/truck-loading' },
    { label: 'Items to be Stocked', value: String(itemsToStock), icon: '📦', href: '/warehouse/inventory' },
    { label: 'Low Stock Alerts', value: String(lowStock), icon: '⚠️', href: '/warehouse/inventory' },
  ]), [incomingTrips, dispatchesReady, itemsToStock, lowStock])

  return (
    <div className="warehouse-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Warehouse Overview</h1>
        <div className="branch-chip">{selectedBranch}</div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <a key={index} className="stat-card stat-link" href={stat.href}>
            <div className="stat-header">
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
            </div>
          </a>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="chart-card large">
          <div className="card-header">
            <h2>Recent Activities</h2>
          </div>
          <div className="activities-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-message">{activity.message}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WarehouseDashboard