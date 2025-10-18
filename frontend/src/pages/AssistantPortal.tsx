import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import MyAssignments from './assistant/MyAssignments'
import DeliveryConfirmation from './assistant/DeliveryConfirmation'
import Notifications from './assistant/Notifications'

function AssistantPortal() {
  return (
    <PortalLayout
      userType="assistant"
      userName="Assistant User"
      userEmail="assistant@dashdark.com"
    >
      <Routes>
        <Route path="/" element={<MyAssignments />} />
        <Route path="/confirmation" element={<DeliveryConfirmation />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/assistant" replace />} />
      </Routes>
    </PortalLayout>
  )
}

export default AssistantPortal
