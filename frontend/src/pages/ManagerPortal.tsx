import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import ManagerDashboard from './manager/ManagerDashboard'
import TrainScheduling from './manager/TrainScheduling'
import TruckScheduling from './manager/TruckScheduling'
import OrdersManagement from './manager/OrdersManagement'
import ManagerReports from './manager/ManagerReports'

function ManagerPortal() {
  return (
    <PortalLayout
      userType="manager"
      userName="Jane Smith"
      userEmail="jane.smith@kandypack.com"
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
