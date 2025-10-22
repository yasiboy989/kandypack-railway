import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { registerCustomer } from '../../lib/api'
import '../../pages/LoginPage.css'

function CustomerLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ username: '', password: '', name: '', email: '', contactNumber: '', company: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const roleRoutes: Record<string, string> = {
    admin: '/admin',
    manager: '/manager',
    warehouse: '/warehouse',
    driver: '/driver',
    assistant: '/assistant',
    customer: '/customer',
    customerrep: '/customer',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setInfo(null)

    if (isLogin) {
      try {
        const profile = await login(formData.username, formData.password)
        const roleKey = profile.role?.toLowerCase() || ''
        if (roleKey.includes('customer')) {
          navigate('/customer', { replace: true })
        } else {
          navigate(roleRoutes[roleKey] || '/', { replace: true })
        }
      } catch (err) {
        setError('Invalid credentials or server unavailable')
      } finally {
        setSubmitting(false)
      }
    } else {
      // Sign up flow for customers
      try {
        const payload = {
          username: formData.username || formData.email,
          password: formData.password,
          name: formData.name,
          type: 'Retail',
          address: formData.company || '',
          city: '',
          contactNumber: formData.contactNumber,
          email: formData.email,
        }
        await registerCustomer(payload)
        setInfo('Signup request submitted. If backend does not support public signup, contact support.')
      } catch (err:any) {
        console.error('registerCustomer error', err)
        const backendMsg = err?.body?.detail ?? err?.detail ?? err?.message ?? String(err)
        setError(`Signup failed: ${backendMsg}. Ensure the backend is running and VITE_API_URL is set to the API URL.`)
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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
            <h2 className="login-tagline">Customer Portal</h2>
            <p className="login-description">Access your orders, track deliveries and manage your account.</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <div className="login-tabs">
              <button className={`login-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Login</button>
              <button className={`login-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Sign Up</button>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required className="input-field" />
                </div>
              )}

              {isLogin ? (
                <>
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Enter your username" required className="input-field" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required className="input-field" />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" required className="input-field" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Choose a password" required className="input-field" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required className="input-field" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactNumber">Contact Number</label>
                    <input type="text" id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Enter contact number" className="input-field" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="company">Company / Address</label>
                    <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Company or address" className="input-field" />
                  </div>
                </>
              )}

              <button type="submit" className="btn-submit" disabled={submitting}>{submitting ? 'Working…' : isLogin ? 'Login' : 'Sign Up'} →</button>

              {error && <div className="forgot-password" style={{ color: 'var(--danger, #d33)' }}>{error}</div>}
              {info && <div className="forgot-password" style={{ color: 'var(--brand, #0b76ff)' }}>{info}</div>}

              <div className="login-footer">
                <p>{isLogin ? "Don't have an account? " : 'Already have an account? '}<button type="button" className="toggle-link" onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Sign Up' : 'Login'}</button></p>
              </div>
            </form>

            <div className="customer-link">
              <p>Staff? <a href="/login">Staff login</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerLogin
