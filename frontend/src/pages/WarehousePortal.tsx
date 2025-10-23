import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import { useAuth } from '../context/AuthContext'
import WarehouseDashboard from './warehouse/WarehouseDashboard'
import InventoryManagement from './warehouse/InventoryManagement'
import StockReports from './warehouse/StockReports'
import StoreStockView from './warehouse/StoreStockView'
import StockAlerts from './warehouse/StockAlerts'

function WarehousePortal() {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>

  // If not authenticated, redirect to login
  if (!user) return <Navigate to="/login" replace />

  const roleLower = (user.role || '').toLowerCase()
  // Allow warehouse-related roles
  if (!roleLower.includes('warehouse')) {
    // If authenticated but not a warehouse staff, redirect to appropriate portal
    return <Navigate to="/login" replace />
  }

  return (
    <PortalLayout
      userType="warehouse"
      userName={user.user_name}
      userEmail={user.email}
    >
      <Routes>
        <Route path="/" element={<WarehouseDashboard />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="reports" element={<StockReports />} />
        <Route path="store-stock" element={<StoreStockView />} />
        <Route path="alerts" element={<StockAlerts />} />
        <Route path="*" element={<Navigate to="/warehouse" replace />} />
      </Routes>
    </PortalLayout>
  )
}

export default WarehousePortal
