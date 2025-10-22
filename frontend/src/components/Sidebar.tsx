import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Sidebar.css'
import { useAuth } from '../context/AuthContext'

interface SidebarProps {
  userType: 'admin' | 'manager' | 'warehouse' | 'driver' | 'assistant' | 'customer'
  userName: string
  userEmail: string
  userAvatar?: string
}

const menuItems = {
  admin: [
    { icon: '📊', label: 'Dashboard', path: '/admin' },
    { icon: '👥', label: 'User Management', path: '/admin/users' },
    { icon: '⚙️', label: 'System Configuration', path: '/admin/config' },
    { icon: '📈', label: 'Reports Center', path: '/admin/reports' },
    { icon: '📝', label: 'Audit Logs', path: '/admin/logs' },
  ],
  manager: [
    { icon: '📊', label: 'Dashboard', path: '/manager' },
    { icon: '🚂', label: 'Train Scheduling', path: '/manager/train' },
    { icon: '🚛', label: 'Truck Scheduling', path: '/manager/truck' },
    { icon: '📦', label: 'Orders Management', path: '/manager/orders' },
    { icon: '📈', label: 'Reports', path: '/manager/reports' },
  ],
  warehouse: [
    { icon: '📊', label: 'Dashboard', path: '/warehouse' },
    { icon: '📦', label: 'Inventory Management', path: '/warehouse/inventory' },
    { icon: '🚂', label: 'Unloading Confirmation', path: '/warehouse/unloading' },
    { icon: '📤', label: 'Dispatch Preparation', path: '/warehouse/dispatch' },
  ],
  driver: [
    { icon: '📊', label: 'Dashboard', path: '/driver' },
    { icon: '🚛', label: 'My Deliveries', path: '/driver/deliveries' },
    { icon: '✓', label: 'Delivery Actions', path: '/driver/actions' },
    { icon: '🔔', label: 'Notifications', path: '/driver/notifications' },
    { icon: '👤', label: 'Profile', path: '/driver/profile' },
  ],
  assistant: [
    { icon: '📋', label: 'My Assignments', path: '/assistant' },
    { icon: '✓', label: 'Delivery Confirmation', path: '/assistant/confirmation' },
    { icon: '🔔', label: 'Notifications', path: '/assistant/notifications' },
  ],
  customer: [
    { icon: '📊', label: 'Dashboard', path: '/customer' },
    { icon: '➕', label: 'Place New Order', path: '/customer/new-order' },
    { icon: '📜', label: 'Order History', path: '/customer/history' },
    { icon: '⚙️', label: 'Profile Settings', path: '/customer/settings' },
  ],
}

function LogoutButton() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const handle = () => {
    logout()
    navigate('/login')
  }
  return (
    <button className="logout-btn" onClick={handle}>
      Logout
    </button>
  )
}

function Sidebar({ userType, userName, userEmail, userAvatar }: SidebarProps) {
  const location = useLocation()
  const items = menuItems[userType]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <div className="logo-shape logo-shape-1"></div>
            <div className="logo-shape logo-shape-2"></div>
          </div>
          <span className="logo-text">Dashdark X</span>
        </div>
      </div>

      <div className="sidebar-search">
        <input type="text" placeholder="Search for..." className="search-input" />
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-divider"></div>

      <div className="sidebar-settings">
        <Link to={`/${userType}/settings`} className="nav-item">
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Settings</span>
        </Link>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} />
          ) : (
            <div className="avatar-placeholder">{userName.charAt(0)}</div>
          )}
        </div>
        <div className="user-info">
          <div className="user-name">{userName}</div>
          <div className="user-email">{userEmail}</div>
        </div>
      </div>

      <LogoutButton />
    </div>
  )
}

export default Sidebar
