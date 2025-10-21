import { Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'

function AssistantDashboard() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 className="page-title">Assistant Dashboard</h1>
      <p className="page-subtitle">Support deliveries and manage assignments (Mobile-First)</p>
      <div style={{ marginTop: '32px', padding: '40px', background: 'var(--secondary-color-1)', borderRadius: '12px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
        <p style={{ color: 'var(--neutral-400)' }}>Assistant lightweight mobile dashboard</p>
      </div>
    </div>
  )
}

function AssistantPortal() {
  return (
    <PortalLayout
      userType="assistant"
      userName="Alex Rodriguez"
      userEmail="alex.rodriguez@dashdark.com"
    >
      <Routes>
        <Route path="/" element={<AssistantDashboard />} />
        <Route path="*" element={<Navigate to="/assistant" replace />} />
      </Routes>
    </PortalLayout>
  )
}

export default AssistantPortal
