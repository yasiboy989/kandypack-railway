import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
// import CustomerPortal from './pages/CustomerPortal'
import AdminPortal from './pages/AdminPortal'
import ManagerPortal from './pages/ManagerPortal'
import WarehousePortal from './pages/WarehousePortal'
import DriverPortal from './pages/DriverPortal'
import AssistantPortal from './pages/AssistantPortal'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/customer/*" element={<CustomerPortal />} /> */}
        <Route path="/admin/*" element={<AdminPortal />} />
        <Route path="/manager/*" element={<ManagerPortal />} />
        <Route path="/warehouse/*" element={<WarehousePortal />} />
        <Route path="/driver/*" element={<DriverPortal />} />
        <Route path="/assistant/*" element={<AssistantPortal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
