import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import ManagerDashboard from './manager/ManagerDashboard'
import TrainScheduling from './manager/TrainScheduling'
import TruckScheduling from './manager/TruckScheduling'
import OrdersManagement from './manager/OrdersManagement'
import ManagerReports from './manager/ManagerReports'
import { useAuth } from '../context/AuthContext'

function ManagerPortal() {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>

  // If not authenticated, redirect to login
  if (!user) return <Navigate to="/login" replace />

  const roleLower = (user.role || '').toLowerCase()
  // Allow manager-related roles
  if (!roleLower.includes('manager')) {
    // If authenticated but not a manager, redirect to appropriate portal
    return <Navigate to="/login" replace />
  }

  return (
    <PortalLayout
      userType="manager"
      userName={user.user_name}
      userEmail={user.email}
    >
      <Routes>
        <Route path="/" element={<ManagerDashboard />} />
        <Route path="/train" element={<TrainScheduling />} />
        <Route path="/truck" element={<TruckScheduling />} />
        <Route path="/orders" element={<OrdersManagement />} />
        <Route path="/reports" element={<ManagerReports />} />
        <Route path="*" element={<Navigate to="/manager" replace />} />
      </Routes>
    </PortalLayout>
  )
}

export default ManagerPortal
