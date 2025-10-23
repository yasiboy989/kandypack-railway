interface IconProps {
  size?: number
  className?: string
}

export function DashboardIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M3 3H11V11H3V3Z" fill="url(#gradient)" />
      <path d="M13 3H21V11H13V3Z" fill="url(#gradient)" opacity="0.7" />
      <path d="M3 13H11V21H3V13Z" fill="url(#gradient)" opacity="0.7" />
      <path d="M13 13H21V21H13V13Z" fill="url(#gradient)" opacity="0.5" />
    </svg>
  )
}

export function UserManagementIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <circle cx="8" cy="7" r="3" fill="url(#gradient)" />
      <path d="M2 19C2 15.134 4.686 12 8 12C11.314 12 14 15.134 14 19" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="8" r="2.5" fill="url(#gradient)" opacity="0.7" />
      <path d="M13 19C13 16.157 14.791 13.8 17 13.8C19.209 13.8 21 16.157 21 19" stroke="url(#gradient)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

export function ConfigIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="3" fill="url(#gradient)" />
      <path d="M12 2V4M12 20V22M22 12H20M4 12H2" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M19.07 4.93L17.65 6.35M6.35 17.65L4.93 19.07M19.07 19.07L17.65 17.65M6.35 6.35L4.93 4.93" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

export function ReportsIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M3 3H21V21H3V3Z" stroke="url(#gradient)" strokeWidth="2" fill="none" />
      <path d="M7 15L10 11L14 14L19 8" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AuditLogsIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M4 6H20M4 12H20M4 18H20" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 3V21C2 21.5304 2.21071 22.0391 2.58579 22.4142C2.96086 22.7893 3.46957 23 4 23H20" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

export function TrainIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <rect x="2" y="6" width="20" height="10" rx="2" fill="url(#gradient)" opacity="0.8" />
      <circle cx="6" cy="18" r="2" fill="url(#gradient)" />
      <circle cx="18" cy="18" r="2" fill="url(#gradient)" />
      <path d="M3 6L5 2H19L21 6" stroke="url(#gradient)" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function TruckIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <rect x="1" y="6" width="13" height="10" rx="1" fill="url(#gradient)" opacity="0.8" />
      <path d="M14 8H23V14H14Z" fill="url(#gradient)" opacity="0.6" />
      <circle cx="5" cy="18" r="2" fill="url(#gradient)" />
      <circle cx="19" cy="18" r="2" fill="url(#gradient)" />
    </svg>
  )
}

export function PackageIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M12 2L3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7L12 2Z" fill="url(#gradient)" opacity="0.8" />
      <path d="M12 2V12M3 7H21M12 12L3 7M12 12L21 7" stroke="url(#gradient)" strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}

export function CheckIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M3 12L9 18L21 6" stroke="url(#gradient)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function NotificationIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" fill="url(#gradient)" opacity="0.7" />
      <path d="M12 6V12L16 16" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function ProfileIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="8" r="4" fill="url(#gradient)" />
      <path d="M4 20C4 16.134 7.134 13 12 13C16.866 13 20 16.134 20 20" fill="url(#gradient)" opacity="0.7" />
    </svg>
  )
}

export function SettingsIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="3" fill="url(#gradient)" />
      <path d="M12 2V4M12 20V22M22 12H20M4 12H2" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M19.07 4.93L17.65 6.35M6.35 17.65L4.93 19.07M19.07 19.07L17.65 17.65M6.35 6.35L4.93 4.93" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

export function OrderHistoryIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M3 4H21C21.5304 4 22.0391 4.21071 22.4142 4.58579C22.7893 4.96086 23 5.46957 23 6V20C23 20.5304 22.7893 21.0391 22.4142 21.4142C22.0391 21.7893 21.5304 22 21 22H3C2.46957 22 1.96086 21.7893 1.58579 21.4142C1.21071 21.0391 1 20.5304 1 20V6C1 5.46957 1.21071 4.96086 1.58579 4.58579C1.96086 4.21071 2.46957 4 3 4Z" fill="url(#gradient)" opacity="0.8" />
      <path d="M5 9H19M5 15H19" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

export function PlusIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M12 2V22M2 12H22" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function SupportIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M3 11C3 7.13401 6.13401 4 10 4H14C17.866 4 21 7.13401 21 11V16C21 17.1046 20.1046 18 19 18H18V20C18 20.5304 17.7893 21.0391 17.4142 21.4142C17.0391 21.7893 16.5304 22 16 22H8C7.46957 22 6.96086 21.7893 6.58579 21.4142C6.21071 21.0391 6 20.5304 6 20V18H5C3.89543 18 3 17.1046 3 16V11Z" fill="url(#gradient)" opacity="0.8" />
      <circle cx="9" cy="12" r="1" fill="white" opacity="0.8" />
      <circle cx="12" cy="12" r="1" fill="white" opacity="0.8" />
      <circle cx="15" cy="12" r="1" fill="white" opacity="0.8" />
    </svg>
  )
}

export function DeliveryIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <rect x="2" y="8" width="14" height="10" rx="2" fill="url(#gradient)" opacity="0.8" />
      <path d="M16 10H22V16H16Z" fill="url(#gradient)" opacity="0.6" />
      <circle cx="6" cy="20" r="2" fill="url(#gradient)" />
      <circle cx="18" cy="20" r="2" fill="url(#gradient)" />
      <path d="M16 8V10" stroke="url(#gradient)" strokeWidth="1.5" />
    </svg>
  )
}

export function InventoryIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="7" height="7" fill="url(#gradient)" opacity="0.9" />
      <rect x="2" y="10" width="7" height="7" fill="url(#gradient)" opacity="0.7" />
      <rect x="10" y="2" width="7" height="7" fill="url(#gradient)" opacity="0.7" />
      <rect x="10" y="10" width="7" height="7" fill="url(#gradient)" opacity="0.5" />
    </svg>
  )
}

export function DispatchIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M3 8L12 3L21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V8Z" fill="url(#gradient)" opacity="0.8" />
      <path d="M12 3V20M3 8H21" stroke="url(#gradient)" strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}

export function AssignmentsIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M4 3H20C20.5304 3 21.0391 3.21071 21.4142 3.58579C21.7893 3.96086 22 4.46957 22 5V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3Z" fill="url(#gradient)" opacity="0.8" />
      <path d="M7 8H17M7 13H17M7 18H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

export function HeartIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="url(#gradient)" />
    </svg>
  )
}

export function CartIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <circle cx="9" cy="21" r="1" fill="url(#gradient)" />
      <circle cx="20" cy="21" r="1" fill="url(#gradient)" />
      <path d="M1 1H5L7.68 14.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="url(#gradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MoneyIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <rect x="1" y="4" width="22" height="16" rx="2" fill="url(#gradient)" opacity="0.8" />
      <circle cx="12" cy="12" r="3" fill="white" opacity="0.8" />
      <path d="M7 12H9M15 12H17" stroke="white" strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}

export function ShoppingIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <circle cx="9" cy="21" r="1" fill="url(#gradient)" />
      <circle cx="20" cy="21" r="1" fill="url(#gradient)" />
      <path d="M1 1H5L7.68 14.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="url(#gradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CityIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M3 9H7V22H3V9Z" fill="url(#gradient)" opacity="0.8" />
      <path d="M10 4H14V22H10V4Z" fill="url(#gradient)" opacity="0.7" />
      <path d="M17 11H21V22H17V11Z" fill="url(#gradient)" opacity="0.6" />
      <path d="M3 9L12 2L21 9" stroke="url(#gradient)" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function MapIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M3 6L9 3L15 6L21 3V18L15 21L9 18L3 21V6Z" fill="url(#gradient)" opacity="0.8" />
      <path d="M9 3V18M15 6V21" stroke="url(#gradient)" strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}

export function TimerIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="13" r="9" fill="url(#gradient)" opacity="0.7" />
      <path d="M12 9V13L15 15" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M9 2H15" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function ReceiptIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M4 3H20C20.5304 3 21.0391 3.21071 21.4142 3.58579C21.7893 3.96086 22 4.46957 22 5V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3Z" fill="url(#gradient)" opacity="0.8" />
      <path d="M7 8H17M7 13H17M7 18H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

export function DocumentIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CB3CFF" />
          <stop offset="100%" stopColor="#7F25FB" />
        </linearGradient>
      </defs>
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="url(#gradient)" opacity="0.8" />
      <path d="M14 2V8H20" stroke="url(#gradient)" strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}
