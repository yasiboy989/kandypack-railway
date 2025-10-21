import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import ManagerDashboard from './manager/ManagerDashboard'
import TrainScheduling from './manager/TrainScheduling'
import TruckScheduling from './manager/TruckScheduling'
import OrdersManagement from './manager/OrdersManagement'
import Reports from './manager/Reports'
import Trucks from './manager/Trucks'
import DRoute from './manager/Routes'
import Employees from './manager/Employees'

function ManagerPortal() {
  return (
    <PortalLayout
      userType="manager"
      userName="Manager User"
      userEmail="manager@dashdark.com"
    >
      <Routes>
        <Route path="/" element={<ManagerDashboard />} />
        <Route path="/train" element={<TrainScheduling />} />
        <Route path="/truck" element={<TruckScheduling />} />
        <Route path="/trucks" element={<Trucks />} />
        <Route path="/routes" element={<DRoute />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/orders" element={<OrdersManagement />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/manager" replace />} />
      </Routes>
    </PortalLayout>
  )
}

export default ManagerPortal
