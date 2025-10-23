import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Sidebar.css'
import { useAuth } from '../context/AuthContext'
import {
  DashboardIcon,
  UserManagementIcon,
  ReportsIcon,
  AuditLogsIcon,
  TrainIcon,
  TruckIcon,
  PackageIcon,
  CheckIcon,
  NotificationIcon,
  OrderHistoryIcon,
  PlusIcon,
  AssignmentsIcon,
  DeliveryIcon,
} from './Icons'

interface SidebarProps {
  userType: 'admin' | 'manager' | 'warehouse' | 'assistant' | 'customer' | 'driver'
  userName: string
  userEmail: string
  userAvatar?: string
}

const menuItems = {
  admin: [
    { icon: DashboardIcon, label: 'Dashboard', path: '/admin' },
    { icon: UserManagementIcon, label: 'User & Role Management', path: '/admin/users' },
    { icon: ReportsIcon, label: 'Reports Center', path: '/admin/reports' },
    { icon: AuditLogsIcon, label: 'Audit Logs', path: '/admin/logs' },
  ],
  manager: [
    { icon: DashboardIcon, label: 'Dashboard', path: '/manager' },
    { icon: TrainIcon, label: 'Train Scheduling', path: '/manager/train' },
    { icon: TruckIcon, label: 'Truck Scheduling', path: '/manager/truck' },
    { icon: PackageIcon, label: 'Orders Management', path: '/manager/orders' },
    { icon: ReportsIcon, label: 'Reports', path: '/manager/reports' },
  ],
  warehouse: [
    { icon: DashboardIcon, label: 'Dashboard', path: '/warehouse' },
    { icon: PackageIcon, label: 'Inventory Management', path: '/warehouse/inventory' },
    { icon: ReportsIcon, label: 'Stock Reports', path: '/warehouse/reports' },
    { icon: DeliveryIcon, label: 'Store Stock View', path: '/warehouse/store-stock' },
    { icon: NotificationIcon, label: 'Stock Alerts', path: '/warehouse/alerts' },
  ],
  driver: [
    { icon: DashboardIcon, label: 'Dashboard', path: '/driver' },
  ],
  assistant: [
    { icon: AssignmentsIcon, label: 'My Assignments', path: '/assistant/assignments' },
    { icon: CheckIcon, label: 'Delivery Confirmation', path: '/assistant/confirmation' },
    { icon: NotificationIcon, label: 'Notifications', path: '/assistant/notifications' },
  ],
  customer: [
    { icon: DashboardIcon, label: 'Dashboard', path: '/customer' },
    { icon: PlusIcon, label: 'Place New Order', path: '/customer/new-order' },
    { icon: OrderHistoryIcon, label: 'Order History', path: '/customer/history' },
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
    <button className="logout-btn btn-logout-primary" onClick={handle}>
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
          <span className="logo-text">Kandypack</span>
        </div>
      </div>

      <div className="sidebar-search">
        <input type="text" placeholder="Search for..." className="search-input" />
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const IconComponent = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <IconComponent size={18} />
              </span>
              <span className="nav-label">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-divider"></div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} />
          ) : (
            <div className="avatar-placeholder">{userName.charAt(0)}</div>
          )}
        </div>
        <div className="user-info">
          <div className="user-email">{userEmail}</div>
        </div>
      </div>

      <LogoutButton />
    </div>
  )
}

export default Sidebar
