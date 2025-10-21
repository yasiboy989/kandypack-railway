import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
import apiFetch from '../../utils/api'
import './MyAssignments.css'

interface Assignment {
  delivery_id: number | string
  route_name?: string
  route_start?: string
  route_end?: string
  truck_plate?: string
  driver_name?: string
  status: string
  delivery_date_time?: string
  customer_name?: string
  address?: string
}

interface OrderItem {
  order_id: number | string
  customer_name?: string
  address?: string
  status?: string
}

function MyAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assistantId, setAssistantId] = useState<number | null>(null)
  const [currentDelivery, setCurrentDelivery] = useState<Assignment | null>(null)
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  // const navigate = useNavigate()

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await apiFetch('/deliveries/deliveries')
        if (!res.ok) throw new Error('Failed to fetch assignments')
        const list = await res.json()
        const storedEmpId = (localStorage.getItem('employee_id') || '').trim()
        const storedUserId = (localStorage.getItem('user_id') || '').trim()
        const empId = /^(\d+)$/.test(storedEmpId) ? Number(storedEmpId) : null
        const uid = empId ?? (/^(\d+)$/.test(storedUserId) ? Number(storedUserId) : null)
        setAssistantId(uid)
        const mine: Assignment[] = (list || [])
          .filter((d: any) => (d.assistant_employee_id ?? d.assistantId) == uid)
          .map((d: any) => ({
            delivery_id: d.delivery_id ?? d.id ?? d[0],
            route_name: d.route_name,
            route_start: d.route_start,
            route_end: d.route_end,
            truck_plate: d.truck_plate,
            driver_name: d.driver_name ?? (d.driver_first_name || d.driver_last_name ? `${d.driver_first_name ?? ''} ${d.driver_last_name ?? ''}`.trim() : undefined),
            status: d.status ?? 'pending',
            delivery_date_time: d.delivery_date_time,
            customer_name: d.customer_name ?? d.customer ?? undefined,
            address: d.address ?? d.destination_address ?? d.route_end ?? undefined,
          }))
        setAssignments(mine)
        // pick the first as current delivery (generally assistant has one)
        const chosen = mine[0] ?? null
        setCurrentDelivery(chosen)
        if (chosen) {
          setOrdersLoading(true)
          setOrdersError(null)
          try {
            // Try to fetch orders for this delivery if the backend supports it
            const oRes = await apiFetch(`/deliveries/${chosen.delivery_id}/orders`)
            if (oRes.ok) {
              const raw = await oRes.json()
              const mapped: OrderItem[] = (raw || []).map((r: any) => ({
                order_id: r.order_id ?? r.id ?? r[0],
                customer_name: r.customer_name ?? r.customer ?? r[1],
                address: r.address ?? r.destination_address ?? r[2],
                status: r.status ?? 'Pending',
              }))
              setOrders(mapped)
            } else {
              // Graceful fallback: fetch all orders and filter by delivery_id
              const allRes = await apiFetch('/api/orders')
              if (allRes.ok) {
                const all = await allRes.json()
                const filtered: OrderItem[] = (all || [])
                  .filter((o: any) => String(o.delivery_id ?? o.deliveryId ?? o[5]) === String(chosen.delivery_id))
                  .map((o: any) => ({
                    order_id: o.id ?? o.order_id ?? o[0],
                    customer_name: o.customerName ?? o.customer_name ?? o[1],
                    address: o.customerAddress ?? o.address ?? o[2],
                    status: o.status ?? 'Pending',
                  }))
                setOrders(filtered)
              } else {
                setOrders([])
              }
            }
          } catch (e) {
            setOrders([])
            if (e instanceof Error) setOrdersError(e.message)
          } finally {
            setOrdersLoading(false)
          }
        }
      } catch (err) {
        if (err instanceof Error) setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [])

  // Delivery-level confirmation is no longer needed; confirmations are per order.

  return (
    <div className="my-assignments">
      <div className="page-header">
        <h1>My Assignments</h1>
      </div>
      {/* Simple stacked details card (row-by-row) */}
      {currentDelivery && (
        <div className="assignment-details-card">
          <div className="detail-row"><div className="detail-key">Delivery</div><div className="detail-val">{currentDelivery.delivery_id}</div></div>
          <div className="detail-row"><div className="detail-key">Route</div><div className="detail-val">{currentDelivery.route_name || `${currentDelivery.route_start ?? ''} → ${currentDelivery.route_end ?? ''}`}</div></div>
          <div className="detail-row"><div className="detail-key">When</div><div className="detail-val">{currentDelivery.delivery_date_time ? new Date(currentDelivery.delivery_date_time).toLocaleString() : '-'}</div></div>
          <div className="detail-row"><div className="detail-key">Truck</div><div className="detail-val">{currentDelivery.truck_plate || '-'}</div></div>
          <div className="detail-row"><div className="detail-key">Driver</div><div className="detail-val">{currentDelivery.driver_name || '-'}</div></div>
          <div className="detail-row"><div className="detail-key">Status</div><div className="detail-val"><span className={`status-badge ${currentDelivery.status.toLowerCase().replace(/\s+/g,'-')}`}>{currentDelivery.status}</span></div></div>
        </div>
      )}
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {!loading && !error && assignments.length === 0 && (
        <div style={{ margin: '0.5rem 0', color: 'var(--neutral-400)' }}>
          No assignments found for assistant user_id: <strong>{assistantId ?? 'not set'}</strong>.
          <div style={{ marginTop: 4 }}>
            Tip: In your browser console run: <code>localStorage.setItem('user_id', '2')</code> (replace 2 with the assistant's employee_id),
            then refresh. Also ensure at least one delivery has assistant_employee_id = that ID.
          </div>
        </div>
      )}
      {/* Removed card view for current assignment per request. */}

      <div className="assignments-list">
        <div className="assignment-card">
          <div className="card-header">
            <h3>Orders {orders.length ? `(${orders.length})` : ''}</h3>
          </div>
          {ordersLoading && <div className="orders-loading">Loading orders…</div>}
          {ordersError && <div className="orders-error">Failed to load orders: {ordersError}</div>}
          {!ordersLoading && !ordersError && orders.length === 0 && (
            <div className="orders-empty">
              No orders found for this delivery yet. If your backend exposes
              <code> GET /deliveries/{'{delivery_id}'}/orders </code>, this list will populate automatically.
            </div>
          )}
          {orders.length > 0 && (
            <div className="orders-grid">
              {orders.map((o) => {
                const delivered = (o.status || '').toLowerCase() === 'delivered'
                return (
                  <div key={String(o.order_id)} className="order-card">
                    <div className="order-header">
                      <div className="order-title">Order #{String(o.order_id)}</div>
                      <span className={`status-badge ${String(o.status || 'pending').toLowerCase().replace(/\s+/g,'-')}`}>{o.status ?? 'Pending'}</span>
                    </div>
                    <div className="order-body">
                      <div className="order-meta"><span className="meta-label">Customer</span><span className="meta-value">{o.customer_name ?? '-'}</span></div>
                      <div className="order-meta"><span className="meta-label">Address</span><span className="meta-value">{o.address ?? '-'}</span></div>
                    </div>
                    <div className="order-actions" style={{ gap: 8 }}>
                      <button
                        className="btn-primary"
                        onClick={async () => {
                          try {
                            let res = await apiFetch(`/api/orders/${o.order_id}/status`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'Delivered' }),
                            })
                            if (!res.ok) {
                              res = await apiFetch(`/orders/${o.order_id}/status`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'Delivered' }),
                              })
                            }
                            if (!res.ok) throw new Error('Failed to mark order delivered')
                            setOrders((prev) => prev.map((it) => it.order_id === o.order_id ? { ...it, status: 'Delivered' } : it))
                          } catch (e) {
                            if (e instanceof Error) alert(e.message)
                          }
                        }}
                        disabled={delivered}
                      >
                        {delivered ? 'Delivered' : 'Mark Delivered'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyAssignments