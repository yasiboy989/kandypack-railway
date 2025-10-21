import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import './PortalLayout.css'

interface PortalLayoutProps {
  children: ReactNode
  userType: 'admin' | 'manager' | 'warehouse' | 'driver' | 'assistant' | 'customer'
  userName: string
  userEmail: string
  userAvatar?: string
  pageTitle?: string
  headerActions?: ReactNode
}

function PortalLayout({
  children,
  userType,
  userName,
  userEmail,
  userAvatar,
  pageTitle,
  headerActions,
}: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // On small screens, start with sidebar closed
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setSidebarOpen(!mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return (
    <div className="portal-layout" data-sidebar-open={sidebarOpen ? 'true' : 'false'}>
      <Sidebar
        userType={userType}
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
      />
      {/* Scrim overlay for mobile to close sidebar */}
      <div
        className={`sidebar-scrim ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <div className="portal-content">
        <div className="topbar">
          <button
            className="mobile-menu-btn btn-secondary"
            aria-label="Toggle menu"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            ☰
          </button>
          {pageTitle && (
            <div className="portal-header">
              <h1 className="page-title">{pageTitle}</h1>
              {headerActions && <div className="header-actions">{headerActions}</div>}
            </div>
          )}
        </div>
        <div className="portal-main">{children}</div>
      </div>
    </div>
  )
}

export default PortalLayout
