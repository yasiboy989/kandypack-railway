import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import PortalLayout from '../components/PortalLayout'
import { useAuth } from '../context/AuthContext'
import { getAuthToken } from '../lib/api'

interface Assignment {
  delivery_id: number
  delivery_date_time: string
  status: string
  start_location: string
  end_location: string
  plate_number: string
  driver_name: string
  order_count: number
}

interface DeliveryItem {
  order_id: number
  customer_name: string
  product_id: number
  product_name: string
  quantity: number
}

interface Notification {
  type: string
  message: string
  timestamp: string
}

function MyAssignmentsTab() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.employee_id) {
      fetchAssignments()
    }
  }, [user?.employee_id])

  const fetchAssignments = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const token = getAuthToken()
      const response = await fetch(
        `${baseUrl}/deliveries/assistant/${user?.employee_id}/assignments`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading assignments...</div>
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px', color: 'var(--neutral-100)' }}>My Assignments</h2>
      {assignments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-400)' }}>
          No upcoming assignments
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {assignments.map((assignment) => (
            <div
              key={assignment.delivery_id}
              style={{
                background: 'var(--secondary-color-1)',
                border: '1px solid var(--secondary-color-4)',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--neutral-100)', fontSize: '16px', fontWeight: '600' }}>
                    {assignment.end_location}
                  </h3>
                  <p style={{ margin: '8px 0 0 0', color: 'var(--neutral-400)', fontSize: '14px' }}>
                    Truck: {assignment.plate_number}
                  </p>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--neutral-400)', fontSize: '14px' }}>
                    Driver: {assignment.driver_name || 'Not assigned'}
                  </p>
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: assignment.status === 'Delivered' ? 'var(--primary-color-1)' :
                                   assignment.status === 'In Transit' ? '#FFA500' : 'var(--neutral-400)',
                  color: 'var(--neutral-900)',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}>
                  {assignment.status}
                </div>
              </div>
              <div style={{ marginBottom: '12px', padding: '12px', background: 'rgba(203, 60, 255, 0.1)', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: 'var(--neutral-100)', fontSize: '14px' }}>
                  <strong>{assignment.order_count}</strong> orders to deliver
                </p>
              </div>
              <p style={{ margin: 0, color: 'var(--neutral-400)', fontSize: '13px' }}>
                Scheduled: {new Date(assignment.delivery_date_time).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DeliveryConfirmationTab() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<number | null>(null)
  const [items, setItems] = useState<DeliveryItem[]>([])
  const [confirmedItems, setConfirmedItems] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.employee_id) {
      fetchAssignments()
    }
  }, [user?.employee_id])

  const fetchAssignments = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const token = getAuthToken()
      const response = await fetch(
        `${baseUrl}/deliveries/assistant/${user?.employee_id}/assignments`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      if (response.ok) {
        const data = await response.json()
        const inTransit = data.filter((a: Assignment) => a.status === 'In Transit')
        setAssignments(inTransit)
        if (inTransit.length > 0) {
          setSelectedDelivery(inTransit[0].delivery_id)
          fetchItems(inTransit[0].delivery_id)
        }
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async (deliveryId: number) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const token = getAuthToken()
      const response = await fetch(
        `${baseUrl}/deliveries/${deliveryId}/order-items`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setItems(data)
        setConfirmedItems([])
      }
    } catch (err) {
      console.error('Failed to fetch items:', err)
    }
  }

  const handleConfirmItem = async (orderId: number, productId?: number) => {
    if (!selectedDelivery) return

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const token = getAuthToken()
      const response = await fetch(
        `${baseUrl}/deliveries/${selectedDelivery}/confirm-item`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ order_id: orderId, product_id: productId || 0 })
        }
      )
      if (response.ok) {
        setConfirmedItems([...confirmedItems, orderId])
      }
    } catch (err) {
      console.error('Failed to confirm item:', err)
    }
  }

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading deliveries...</div>
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px', color: 'var(--neutral-100)' }}>Delivery Confirmation</h2>

      {assignments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-400)' }}>
          No active deliveries
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--neutral-100)', fontWeight: '600' }}>
              Select Delivery:
            </label>
            <select
              value={selectedDelivery || ''}
              onChange={(e) => {
                const deliveryId = parseInt(e.target.value)
                setSelectedDelivery(deliveryId)
                fetchItems(deliveryId)
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--secondary-color-4)',
                background: 'var(--secondary-color-1)',
                color: 'var(--neutral-100)',
                fontSize: '14px',
              }}
            >
              {assignments.map((a) => (
                <option key={a.delivery_id} value={a.delivery_id}>
                  {a.end_location}
                </option>
              ))}
            </select>
          </div>

          <h3 style={{ color: 'var(--neutral-100)', marginBottom: '16px' }}>Items to Confirm</h3>
          {items.length === 0 ? (
            <p style={{ color: 'var(--neutral-400)' }}>No items for this delivery</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--secondary-color-1)',
                    border: '1px solid var(--secondary-color-4)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: 'var(--neutral-100)', fontWeight: '600' }}>
                      {item.product_name}
                    </p>
                    <p style={{ margin: 0, color: 'var(--neutral-400)', fontSize: '13px' }}>
                      {item.customer_name} - Qty: {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => handleConfirmItem(item.order_id, item.product_id)}
                    disabled={confirmedItems.includes(item.order_id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: confirmedItems.includes(item.order_id) ? 'var(--neutral-600)' : 'var(--primary-color-1)',
                      color: 'var(--neutral-100)',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: confirmedItems.includes(item.order_id) ? 'not-allowed' : 'pointer',
                      opacity: confirmedItems.includes(item.order_id) ? 0.6 : 1,
                    }}
                  >
                    {confirmedItems.includes(item.order_id) ? '✓ Confirmed' : 'Confirm'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function NotificationsTab() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.employee_id) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.employee_id])

  const fetchNotifications = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const token = getAuthToken()
      const response = await fetch(
        `${baseUrl}/deliveries/assistant/${user?.employee_id}/notifications`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading notifications...</div>
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px', color: 'var(--neutral-100)' }}>Notifications</h2>
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-400)' }}>
          No notifications
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((notif, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--secondary-color-1)',
                border: `2px solid ${notif.type === 'Alert' ? '#FFA500' : 'var(--primary-color-1)'}`,
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: notif.type === 'Alert' ? '#FFA500' : 'var(--primary-color-1)',
                    color: 'var(--neutral-900)',
                    fontSize: '11px',
                    fontWeight: '700',
                    marginBottom: '8px',
                  }}>
                    {notif.type}
                  </span>
                  <p style={{ margin: 0, color: 'var(--neutral-100)', fontSize: '14px', lineHeight: '1.4' }}>
                    {notif.message}
                  </p>
                  <p style={{ margin: '8px 0 0 0', color: 'var(--neutral-400)', fontSize: '12px' }}>
                    {new Date(notif.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


function AssistantPortal() {
  return (
    <PortalLayout
      userType="assistant"
      userName="Driver Assistant"
      userEmail="assistant@kandypack.com"
    >
      <Routes>
        <Route path="/" element={<MyAssignmentsTab />} />
        <Route path="/assignments" element={<MyAssignmentsTab />} />
        <Route path="/confirmation" element={<DeliveryConfirmationTab />} />
        <Route path="/notifications" element={<NotificationsTab />} />
        <Route path="*" element={<Navigate to="/assistant" replace />} />
      </Routes>
    </PortalLayout>
  )
}

export default AssistantPortal
