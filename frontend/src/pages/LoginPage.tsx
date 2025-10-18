import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'driver',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would authenticate with backend
    // For now, we'll navigate based on role
    const roleRoutes: Record<string, string> = {
      admin: '/admin',
      manager: '/manager',
      warehouse: '/warehouse',
      driver: '/driver',
      assistant: '/assistant',
    }
    
    navigate(roleRoutes[formData.role] || '/driver')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-branding">
            <div className="logo-large">
              <div className="logo-icon-large">
                <div className="logo-shape logo-shape-1"></div>
                <div className="logo-shape logo-shape-2"></div>
              </div>
              <span className="logo-text-large">Dashdark X</span>
            </div>
            <h2 className="login-tagline">Logistics Management System</h2>
            <p className="login-description">
              Streamline your delivery operations with our comprehensive logistics platform
            </p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <div className="login-tabs">
              <button
                className={`login-tab ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`login-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required={!isLogin}
                    className="input-field"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Logistics Manager</option>
                  <option value="warehouse">Warehouse Staff</option>
                  <option value="driver">Driver</option>
                  <option value="assistant">Driver Assistant</option>
                </select>
              </div>

              <button type="submit" className="btn-submit">
                {isLogin ? 'Login' : 'Sign Up'} →
              </button>

              {isLogin && (
                <div className="forgot-password">
                  <a href="#">Forgot password?</a>
                </div>
              )}
            </form>

            <div className="login-footer">
              <p>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={() => setIsLogin(!isLogin)} className="toggle-link">
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </div>

            <div className="customer-link">
              <p>Looking for customer portal? <a href="/customer">Click here</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
