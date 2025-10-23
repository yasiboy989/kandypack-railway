import { Link } from 'react-router-dom'
import './LandingPage.css'
import {
  UserManagementIcon,
  ReportsIcon,
  PackageIcon,
  TruckIcon,
  ShoppingIcon,
} from '../components/Icons'

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="logo">
          <div className="logo-icon">
            <div className="logo-shape logo-shape-1"></div>
            <div className="logo-shape logo-shape-2"></div>
          </div>
          <span className="logo-text">Kandypack Logistics</span>
        </div>
        <nav className="landing-nav">
          <Link to="/customer" className="nav-link">Customer Login</Link>
          <Link to="/login" className="btn-primary">Staff Login</Link>
        </nav>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Seamless Logistics Management</h1>
            <p className="hero-subtitle">
              Complete end-to-end logistics solution for train and truck delivery coordination
            </p>
            <div className="hero-actions">
              <Link to="/customer/login" className="btn-hero btn-primary-large">
                Access Customer Login →
              </Link>
              <Link to="/login" className="btn-hero btn-secondary-large">
                Staff Login
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="stats-card">
              <div className="stat-item">
                <div className="stat-value">50.8K</div>
                <div className="stat-label">Orders Processed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">98%</div>
                <div className="stat-label">On-Time Delivery</div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2 className="section-title">Comprehensive Portal System</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <UserManagementIcon size={48} />
              </div>
              <h3 className="feature-title">Admin Portal</h3>
              <p className="feature-desc">Full system control, user management, and comprehensive reporting</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <ReportsIcon size={48} />
              </div>
              <h3 className="feature-title">Manager Portal</h3>
              <p className="feature-desc">Train & truck scheduling, route optimization, and operations oversight</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <PackageIcon size={48} />
              </div>
              <h3 className="feature-title">Warehouse Portal</h3>
              <p className="feature-desc">Inventory management, unloading confirmation, and dispatch preparation</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <TruckIcon size={48} />
              </div>
              <h3 className="feature-title">Driver & Assistant Portal</h3>
              <p className="feature-desc">Mobile-friendly delivery schedule with route map, check-in/out for trips, and delivery confirmation</p>
            </div>
            <div className="feature-card feature-card-highlight">
              <div className="feature-icon">
                <ShoppingIcon size={48} />
              </div>
              <h3 className="feature-title">Customer Login</h3>
              <p className="feature-desc">Place orders, track deliveries, and manage account settings</p>
              <Link to="/customer/login" className="feature-link">Get Started →</Link>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to streamline your logistics?</h2>
            <p className="cta-subtitle">Join our platform today and experience efficient delivery management</p>
            <div className="cta-actions">
              <Link to="/customer/login" className="btn-primary-large">
                Customer Login →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© 2024 Kandypack Logistics. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default LandingPage
