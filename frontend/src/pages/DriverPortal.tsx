import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import DriverDashboard from './driver/DriverDashboard'
import MyDeliveries from './driver/MyDeliveries'
import DeliveryActions from './driver/DeliveryActions'
import Notifications from './driver/Notifications'
import Profile from './driver/Profile'

function DriverPortal() {
  return (
    <PortalLayout
      userType="driver"
      userName="Driver User"
      userEmail="driver@dashdark.com"
    >
      <Routes>
        <Route path="/" element={<DriverDashboard />} />
        <Route path="/deliveries" element={<MyDeliveries />} />
        <Route path="/actions" element={<DeliveryActions />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/driver" replace />} />
      </Routes>
    </PortalLayout>
  )
}

export default DriverPortal
