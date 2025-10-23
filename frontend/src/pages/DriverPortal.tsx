import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import { TruckIcon } from '../components/Icons'
import { useAuth } from '../context/AuthContext'

function DriverDashboard() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 className="page-title">Driver Dashboard</h1>
      <p className="page-subtitle">Manage your deliveries and routes (Mobile-Friendly)</p>
      <div style={{ marginTop: '32px', padding: '40px', background: 'var(--secondary-color-1)', borderRadius: '12px', textAlign: 'center' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <TruckIcon size={48} />
        </div>
        <p style={{ color: 'var(--neutral-400)' }}>Driver mobile-friendly dashboard</p>
      </div>
    </div>
  )
}

function DriverPortal() {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>

  // If not authenticated, redirect to login
  if (!user) return <Navigate to="/login" replace />

  const roleLower = (user.role || '').toLowerCase()
  // Allow driver-related roles
  if (!roleLower.includes('driver')) {
    // If authenticated but not a driver, redirect to appropriate portal
    return <Navigate to="/login" replace />
  }

  return (
    <PortalLayout
      userType="driver"
      userName={user.user_name}
      userEmail={user.email}
    >
      <Routes>
        <Route path="/" element={<DriverDashboard />} />
        <Route path="*" element={<Navigate to="/driver" replace />} />
      </Routes>
    </PortalLayout>
  )
}

export default DriverPortal
