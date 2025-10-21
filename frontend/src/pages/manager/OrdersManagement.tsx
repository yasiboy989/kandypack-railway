import { useState, useEffect } from 'react'
import apiFetch from '../../utils/api'
import './OrdersManagement.css'

interface Order {
  order_id: number
  status: string
}

interface DeliveryOption {
  delivery_id: number | string
  route_label: string
  truck_label: string
  status: string
}

interface Allocation { train_trip_id: number | string; order_id: number | string; allocated_space?: number }

function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deliveries, setDeliveries] = useState<DeliveryOption[]>([])
  const [allocations, setAllocations] = useState<Allocation[]>([])
  

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [ordersRes, delivRes, schedulesRes] = await Promise.all([
          apiFetch('/orders'),
          apiFetch('/deliveries/deliveries'),
          apiFetch('/train-trips/train-schedules'),
        ])

        if (!ordersRes.ok) {
          throw new Error('Failed to fetch orders')
        }
        const raw = await ordersRes.json()
        const mapped: Order[] = (raw || []).map((r: any) => ({
          order_id: r.order_id ?? r.id ?? r[0],
          status: String(r.status ?? r[1] ?? 'Pending'),
        }))
        setOrders(mapped)

        // Fetch deliveries list for assignment dropdown
        if (delivRes.ok) {
          const list = await delivRes.json()
          const mappedDeliveries: DeliveryOption[] = (list || []).map((d: any) => ({
            delivery_id: d.delivery_id ?? d.id ?? d[0],
            route_label: d.route_name ?? (d.route_start && d.route_end ? `${d.route_start} → ${d.route_end}` : 'Route'),
            truck_label: d.truck_plate ?? (d.truck_id ? `Truck ${d.truck_id}` : '-'),
            status: d.status ?? 'Pending',
          }))
          setDeliveries(mappedDeliveries)
        }

        // Fetch current train allocations to hide Allocate button
        if (schedulesRes.ok) {
          const sched = await schedulesRes.json()
          const norm: Allocation[] = (sched || []).map((s: any) => ({
            train_trip_id: s.train_trip_id ?? s[0],
            order_id: s.order_id ?? s[1],
            allocated_space: Number(s.allocated_space ?? s[2] ?? 0),
          }))
          setAllocations(norm)
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="orders-management">
      <div className="page-header">
        <h1>Orders Management</h1>
      </div>

      <div className="filters-bar">
        <input type="text" placeholder="Search orders..." className="search-input" />
        <select className="filter-select">
          <option>All Statuses</option>
          <option>Pending</option>
          <option>Scheduled</option>
          <option>In-transit</option>
          <option>Delivered</option>
        </select>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Train</th>
              <th>Truck Delivery</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const statusClass = order.status.toLowerCase().replace(/\s+/g, '-')
              const allocation = allocations.find((a) => String(a.order_id) === String(order.order_id))
              return (
                <tr key={order.order_id}>
                  <td>{order.order_id}</td>
                  <td>
                    <span className={`status-badge ${statusClass}`}>{order.status}</span>
                  </td>
                  <td>
                    {allocation ? (
                      <span className="status-badge scheduled">Allocated (Trip {String(allocation.train_trip_id)})</span>
                    ) : (
                      <button
                        className="btn-secondary"
                        onClick={async () => {
                          try {
                            const res = await apiFetch(`/orders/${order.order_id}/allocate-train`, { method: 'POST' })
                            if (!res.ok) throw new Error('Failed to allocate')
                            const data = await res.json()
                            alert(`Allocated: ${JSON.stringify(data)}`)
                          } catch (e) {
                            if (e instanceof Error) alert(e.message)
                          }
                        }}
                      >
                        Allocate to Train
                      </button>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select
                        className="input-field"
                        defaultValue=""
                        onChange={async (e) => {
                          const deliveryId = e.target.value
                          if (!deliveryId) return
                          try {
                            // Hypothetical existing API
                            const res = await apiFetch(`/deliveries/${deliveryId}/orders/${order.order_id}`, { method: 'POST' })
                            if (!res.ok) throw new Error('Failed to assign to delivery')
                            alert(`Order ${order.order_id} assigned to delivery ${deliveryId}`)
                          } catch (e) {
                            if (e instanceof Error) alert(e.message)
                          }
                        }}
                      >
                        <option value="" disabled>
                          Select delivery…
                        </option>
                        {deliveries.map((d) => (
                          <option key={d.delivery_id} value={String(d.delivery_id)}>
                            #{d.delivery_id} • {d.route_label} • {d.truck_label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrdersManagement