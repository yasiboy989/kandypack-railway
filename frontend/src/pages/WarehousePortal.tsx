import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import WarehouseDashboard from './warehouse/WarehouseDashboard'
import InventoryManagement from './warehouse/InventoryManagement'
import UnloadingConfirmation from './warehouse/UnloadingConfirmation'
import DispatchPreparation from './warehouse/DispatchPreparation'
import { WarehouseProvider, useWarehouse } from './warehouse/WarehouseContext'
import TrainLoading from './warehouse/TrainLoading'
import TruckLoading from './warehouse/TruckLoading'

function WarehouseHeaderActions() {
  const { branches, selectedBranch, setSelectedBranch } = useWarehouse()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <label htmlFor="branch-select" style={{ color: 'var(--neutral-300)', fontSize: 12 }}>Branch</label>
      <select
        id="branch-select"
        className="input-field"
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
        style={{ minWidth: 140 }}
      >
        {branches.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
    </div>
  )
}

function WarehousePortal() {
  return (
    <WarehouseProvider>
      <PortalLayout
        userType="warehouse"
        userName="Warehouse User"
        userEmail="warehouse@dashdark.com"
        pageTitle="Warehouse"
        headerActions={<WarehouseHeaderActions />}
      >
        <Routes>
          <Route path="/" element={<WarehouseDashboard />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/loading" element={<TrainLoading />} />
          <Route path="/truck-loading" element={<TruckLoading />} />
          <Route path="/unloading" element={<UnloadingConfirmation />} />
          <Route path="/dispatch" element={<DispatchPreparation />} />
          <Route path="*" element={<Navigate to="/warehouse" replace />} />
        </Routes>
      </PortalLayout>
    </WarehouseProvider>
  )
}

export default WarehousePortal
