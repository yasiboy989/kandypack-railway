import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import WarehouseDashboard from './warehouse/WarehouseDashboard'
import InventoryManagement from './warehouse/InventoryManagement'
import UnloadingConfirmation from './warehouse/UnloadingConfirmation'
import DispatchPreparation from './warehouse/DispatchPreparation'

function WarehousePortal() {
  return (
    <PortalLayout
      userType="warehouse"
      userName="Warehouse User"
      userEmail="warehouse@dashdark.com"
    >
      <Routes>
        <Route path="/" element={<WarehouseDashboard />} />
        <Route path="/inventory" element={<InventoryManagement />} />
        <Route path="/unloading" element={<UnloadingConfirmation />} />
        <Route path="/dispatch" element={<DispatchPreparation />} />
        <Route path="*" element={<Navigate to="/warehouse" replace />} />
      </Routes>
    </PortalLayout>
  )
}

export default WarehousePortal
