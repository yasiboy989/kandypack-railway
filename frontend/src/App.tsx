import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import CustomerLogin from './pages/customer/CustomerLogin'
import CustomerPortal from './pages/CustomerPortal'
import AdminPortal from './pages/AdminPortal'
import ManagerPortal from './pages/ManagerPortal'
import WarehousePortal from './pages/WarehousePortal'
import AssistantPortal from './pages/AssistantPortal'

function App() {
  return (
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
}

export default App
