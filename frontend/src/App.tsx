import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthProvider, AuthContext } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import CustomerLogin from './pages/customer/CustomerLogin'
import CustomerPortal from './pages/CustomerPortal'
import AdminPortal from './pages/AdminPortal'
import ManagerPortal from './pages/ManagerPortal'
import WarehousePortal from './pages/WarehousePortal'
import AssistantPortal from './pages/AssistantPortal'

function App() {
  const ctx = useContext(AuthContext)
  const Content = (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/*" element={<CustomerPortal />} />
        <Route path="/admin/*" element={<AdminPortal />} />
        <Route path="/manager/*" element={<ManagerPortal />} />
        <Route path="/warehouse/*" element={<WarehousePortal />} />
        <Route path="/assistant/*" element={<AssistantPortal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )

  // If no provider above, wrap here. This avoids crashes when App is rendered in isolation.
  return ctx === undefined ? <AuthProvider>{Content}</AuthProvider> : Content
}

export default App
