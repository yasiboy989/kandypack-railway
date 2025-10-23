import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import AdminDashboard from './admin/AdminDashboard'
import UserAndRoleManagement from './admin/UserAndRoleManagement'
import ReportsCenter from './admin/ReportsCenter'
import AuditLogs from './admin/AuditLogs'
import { useAuth } from '../context/AuthContext'

function AdminPortal() {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>

  // If not authenticated, redirect to login
  if (!user) return <Navigate to="/login" replace />

  const roleLower = (user.role || '').toLowerCase()
  // Allow admin-related roles
  if (!roleLower.includes('admin')) {
    // If authenticated but not an admin, redirect to appropriate portal
    return <Navigate to="/login" replace />
  }

  return (
    <PortalLayout
      userType="admin"
      userName={user.user_name}
      userEmail={user.email}
    >
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users" element={<UserAndRoleManagement />} />
        <Route path="/reports" element={<ReportsCenter />} />
        <Route path="/logs" element={<AuditLogs />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </PortalLayout>
  )
}

export default AdminPortal
