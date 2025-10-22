import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import CustomerDashboard from './customer/CustomerDashboard'
import NewOrder from './customer/NewOrder'
import OrderHistory from './customer/OrderHistory'
import ProfileSettings from './customer/ProfileSettings'
import { useAuth } from '../context/AuthContext'

function CustomerPortal() {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>

  // If not authenticated, redirect to customer login
  if (!user) return <Navigate to="/customer/login" replace />

  const roleLower = (user.role || '').toLowerCase()
  // Allow customer-related roles (customer, customerrep)
  if (!roleLower.includes('customer')) {
    // If authenticated but not a customer, redirect to staff login
    return <Navigate to="/login" replace />
  }

  return (
    <PortalLayout
      userType="customer"
      userName={user.user_name}
      userEmail={user.email}
    >
      <Routes>
        <Route path="/" element={<CustomerDashboard />} />
        <Route path="/new-order" element={<NewOrder />} />
        <Route path="/history" element={<OrderHistory />} />
        <Route path="/settings" element={<ProfileSettings />} />
        <Route path="*" element={<Navigate to="/customer" replace />} />
      </Routes>
    </PortalLayout>
  )
}

export default CustomerPortal
