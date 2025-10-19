import './Profile.css'

function Profile() {
  const assistant = {
    name: 'Mike Perera',
    employeeId: 'EMP002',
    phone: '+94 77 765 4321',
    email: 'mike.perera@kandypack.com',
    weeklyHours: 35,
    maxWeeklyHours: 40,
  }

  const completedAssignments = [
    { id: 'ORD001', customerName: 'John Carter', date: '2024-01-30' },
    { id: 'ORD002', customerName: 'Sophie Moore', date: '2024-01-29' },
    { id: 'ORD003', customerName: 'Matt Cannon', date: '2024-01-28' },
  ]

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">{assistant.name.charAt(0)}</div>
            <div className="profile-name">{assistant.name}</div>
            <div className="profile-id">{assistant.employeeId}</div>
          </div>
          <div className="profile-details">
            <div className="detail-item">
              <div className="detail-label">Phone</div>
              <div className="detail-value">{assistant.phone}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Email</div>
              <div className="detail-value">{assistant.email}</div>
            </div>
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-label">Weekly Hours</div>
              <div className="stat-value">{assistant.weeklyHours} / {assistant.maxWeeklyHours}</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(assistant.weeklyHours / assistant.maxWeeklyHours) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="history-card">
          <h2>Completed Assignments</h2>
          <div className="history-list">
            {completedAssignments.map((assignment) => (
              <div key={assignment.id} className="history-item">
                <div className="history-info">
                  <div className="history-customer">{assignment.customerName}</div>
                  <div className="history-order">Order ID: {assignment.id}</div>
                </div>
                <div className="history-date">{assignment.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
