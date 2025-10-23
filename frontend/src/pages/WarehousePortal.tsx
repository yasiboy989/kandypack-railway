import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import { PackageIcon } from '../components/Icons'

function WarehouseDashboard() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 className="page-title">Warehouse Dashboard</h1>
      <p className="page-subtitle">Manage inventory, unloading, and dispatch operations</p>
      <div style={{ marginTop: '32px', padding: '40px', background: 'var(--secondary-color-1)', borderRadius: '12px', textAlign: 'center' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <PackageIcon size={48} />
        </div>
        <p style={{ color: 'var(--neutral-400)' }}>Warehouse operations dashboard</p>
      </div>
    </div>
  )
}

function WarehousePortal() {
  return (
    <PortalLayout
      userType="warehouse"
      userName="Sarah Davis"
      userEmail="sarah.davis@kandypack.com"
    >
      <Routes>
        <Route path="/" element={<WarehouseDashboard />} />
        <Route path="*" element={<Navigate to="/warehouse" replace />} />
      </Routes>
    </PortalLayout>
  )
}

export default WarehousePortal
