import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import './PortalLayout.css'

interface PortalLayoutProps {
  children: ReactNode
  userType: 'admin' | 'manager' | 'warehouse' | 'assistant' | 'customer'
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
  return (
    <div className="portal-layout">
      <Sidebar
        userType={userType}
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
      />
      <div className="portal-content">
        {pageTitle && (
          <div className="portal-header">
            <h1 className="page-title">{pageTitle}</h1>
            {headerActions && <div className="header-actions">{headerActions}</div>}
          </div>
        )}
        <div className="portal-main">{children}</div>
      </div>
    </div>
  )
}

export default PortalLayout
