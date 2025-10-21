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

function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deliveries, setDeliveries] = useState<DeliveryOption[]>([])
  

  useEffect(() => {
    const fetchOrders = async () => {
      try {
  const response = await apiFetch('/orders')
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        const raw = await response.json()
        const mapped: Order[] = (raw || []).map((r: any) => ({
          order_id: r.order_id ?? r.id ?? r[0],
          status: String(r.status ?? r[1] ?? 'Pending'),
        }))
        setOrders(mapped)

        // Fetch deliveries list for assignment dropdown
        const delivRes = await apiFetch('/deliveries/deliveries')
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
              return (
                <tr key={order.order_id}>
                  <td>{order.order_id}</td>
                  <td>
                    <span className={`status-badge ${statusClass}`}>{order.status}</span>
                  </td>
                  <td>
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