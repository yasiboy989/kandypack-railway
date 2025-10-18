import './Profile.css'

function Profile() {
  const driver = {
    name: 'John Silva',
    employeeId: 'EMP001',
    phone: '+94 77 123 4567',
    email: 'john.silva@kandypack.com',
    weeklyHours: 32,
    maxWeeklyHours: 40,
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">{driver.name.charAt(0)}</div>
          <div className="profile-name">{driver.name}</div>
          <div className="profile-id">{driver.employeeId}</div>
        </div>
        <div className="profile-details">
          <div className="detail-item">
            <div className="detail-label">Phone</div>
            <div className="detail-value">{driver.phone}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Email</div>
            <div className="detail-value">{driver.email}</div>
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-label">Weekly Hours</div>
            <div className="stat-value">{driver.weeklyHours} / {driver.maxWeeklyHours}</div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(driver.weeklyHours / driver.maxWeeklyHours) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile