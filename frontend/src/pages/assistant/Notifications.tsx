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
    { id: 1, message: 'You have been assigned to assist with delivery ORD004.', time: '20 mins ago', read: false },
    { id: 2, message: 'Driver for ORD002 has marked the delivery as complete.', time: '2 hours ago', read: true },
    { id: 3, message: 'New task assigned: Assist with unloading at warehouse.', time: '5 hours ago', read: true },
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