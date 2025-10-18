import { useState } from 'react'
import './Notifications.css'

interface Notification {
  id: number
  message: string
  time: string
  read: boolean
}

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: 'Route for ORD004 has been updated.', time: '15 mins ago', read: false },
    { id: 2, message: 'Delivery for ORD002 has been confirmed by assistant.', time: '1 hour ago', read: true },
    { id: 3, message: 'You have been assigned a new delivery: ORD005.', time: '3 hours ago', read: true },
  ])

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Notifications</h1>
      </div>

      <div className="notifications-list">
        {notifications.map((notification) => (
          <div key={notification.id} className={`notification-item ${notification.read ? 'read' : ''}`}>
            <div className="notification-message">{notification.message}</div>
            <div className="notification-time">{notification.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Notifications