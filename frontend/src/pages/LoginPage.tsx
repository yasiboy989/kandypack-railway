import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LoginPage.css'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'driver',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const roleRoutes: Record<string, string> = {
    admin: '/admin',
    manager: '/manager',
    warehouse: '/warehouse',
    driver: '/driver',
    assistant: '/assistant',
    customer: '/customer',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitting(true)
    setError(null)
    try {
      const profile = await login(formData.email, formData.password)
      const roleKey = profile.role?.toLowerCase()
      navigate(roleRoutes[roleKey] || '/login', { replace: true })
    } catch (err) {
      setError('Invalid credentials or server unavailable')
    } finally {
      setSubmitting(false)
    }
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
            <form onSubmit={handleSubmit} className="login-form">

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

              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Login'} →
              </button>

              {error && (
                <div className="forgot-password" style={{ color: 'var(--danger, #d33)' }}>
                  {error}
                </div>
              )}

              <div className="forgot-password">
                <a href="#">Forgot password?</a>
              </div>
            </form>

            <div className="login-footer">
              <p>
                Need an account? Please contact your system administrator to create a staff account.
              </p>
            </div>

            <div className="customer-link">
              <p>Looking for customer portal? <a href="/customer/login">Click here</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
