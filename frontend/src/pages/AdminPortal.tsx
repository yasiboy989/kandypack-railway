import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import AdminDashboard from './admin/AdminDashboard'
import UserAndRoleManagement from './admin/UserAndRoleManagement'
import ReportsCenter from './admin/ReportsCenter'
import AuditLogs from './admin/AuditLogs'

function AdminPortal() {
  return (
    <PortalLayout
      userType="admin"
      userName="Admin User"
      userEmail="admin@kandypack.com"
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
