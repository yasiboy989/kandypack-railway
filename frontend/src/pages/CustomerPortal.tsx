import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import CustomerDashboard from './customer/CustomerDashboard'
import NewOrder from './customer/NewOrder'
import OrderHistory from './customer/OrderHistory'
import ProfileSettings from './customer/ProfileSettings'

function CustomerPortal() {
  return (
    <PortalLayout
      userType="customer"
      userName="Emma Wilson"
      userEmail="emma@example.com"
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
