import { useState } from 'react'
import './ProfileSettings.css'

function ProfileSettings() {
  const [profile, setProfile] = useState({
    name: 'Emma Wilson',
    email: 'emma@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corp',
    address: '123 Main Street, Suite 100',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
  })

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    orderUpdates: true,
    promotions: false,
  })

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPassword(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = () => {
    console.log('Saving profile:', profile)
    alert('Profile updated successfully!')
  }

  const handleSaveNotifications = () => {
    console.log('Saving notifications:', notifications)
    alert('Notification preferences updated!')
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password.new !== password.confirm) {
      alert('New passwords do not match')
      return
    }
    
    if (password.new.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }

    console.log('Changing password')
    alert('Password changed successfully!')
    setPassword({ current: '', new: '', confirm: '' })
  }

  return (
    <div className="profile-settings">
      <div className="settings-header">
        <div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your account information and preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            <button className="btn-secondary" onClick={handleSaveProfile}>
              Save Changes
            </button>
          </div>

          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input
                  type="text"
                  id="company"
                  value={profile.company}
                  onChange={(e) => handleProfileChange('company', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Street Address</label>
              <input
                type="text"
                id="address"
                value={profile.address}
                onChange={(e) => handleProfileChange('address', e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  value={profile.city}
                  onChange={(e) => handleProfileChange('city', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  value={profile.state}
                  onChange={(e) => handleProfileChange('state', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="zip">ZIP Code</label>
                <input
                  type="text"
                  id="zip"
                  value={profile.zip}
                  onChange={(e) => handleProfileChange('zip', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>Notification Preferences</h2>
            <button className="btn-secondary" onClick={handleSaveNotifications}>
              Save Changes
            </button>
          </div>

          <div className="settings-form">
            <div className="toggle-field">
              <div className="toggle-info">
                <label>Email Notifications</label>
                <span className="field-hint">Receive notifications via email</span>
              </div>
              <input
                type="checkbox"
                className="toggle-input"
                checked={notifications.email}
                onChange={(e) => handleNotificationChange('email', e.target.checked)}
              />
            </div>

            <div className="toggle-field">
              <div className="toggle-info">
                <label>SMS Notifications</label>
                <span className="field-hint">Receive text message alerts</span>
              </div>
              <input
                type="checkbox"
                className="toggle-input"
                checked={notifications.sms}
                onChange={(e) => handleNotificationChange('sms', e.target.checked)}
              />
            </div>

            <div className="toggle-field">
              <div className="toggle-info">
                <label>Order Updates</label>
                <span className="field-hint">Get notified about order status changes</span>
              </div>
              <input
                type="checkbox"
                className="toggle-input"
                checked={notifications.orderUpdates}
                onChange={(e) => handleNotificationChange('orderUpdates', e.target.checked)}
              />
            </div>

            <div className="toggle-field">
              <div className="toggle-info">
                <label>Promotional Emails</label>
                <span className="field-hint">Receive special offers and updates</span>
              </div>
              <input
                type="checkbox"
                className="toggle-input"
                checked={notifications.promotions}
                onChange={(e) => handleNotificationChange('promotions', e.target.checked)}
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input
                type="password"
                id="current-password"
                value={password.current}
                onChange={(e) => handlePasswordChange('current', e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                value={password.new}
                onChange={(e) => handlePasswordChange('new', e.target.value)}
                className="input-field"
                required
              />
              <span className="field-hint">Must be at least 8 characters</span>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                value={password.confirm}
                onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                className="input-field"
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Update Password
            </button>
          </form>
        </div>

        <div className="settings-section danger-zone">
          <div className="section-header">
            <h2>Danger Zone</h2>
          </div>

          <div className="danger-content">
            <div className="danger-info">
              <div className="danger-title">Delete Account</div>
              <div className="danger-desc">
                Permanently delete your account and all associated data. This action cannot be undone.
              </div>
            </div>
            <button className="btn-danger">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
