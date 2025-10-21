import { useState } from 'react'
import './SystemConfig.css'

function SystemConfig() {
  const [config, setConfig] = useState({
    orderCutoffTime: '14:00',
    minDeliveryDays: 7,
    maxDriverHours: 40,
    maxConsecutiveTrips: 5,
    trainCapacity: 100,
    truckCapacity: 20,
  })

  const handleConfigChange = (field: string, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    console.log('Saving configuration:', config)
    alert('Configuration saved successfully!')
  }

  return (
    <div className="system-config">
      <div className="config-header">
        <div>
          <h1 className="page-title">System Configuration</h1>
          <p className="page-subtitle">Manage system parameters and business rules</p>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      <div className="config-grid">
        <div className="config-section">
          <div className="section-header">
            <h2>Order Settings</h2>
            <p className="section-desc">Configure order processing rules</p>
          </div>
          
          <div className="config-form">
            <div className="form-field">
              <label htmlFor="cutoff">Order Cut-off Time</label>
              <input
                type="time"
                id="cutoff"
                value={config.orderCutoffTime}
                onChange={(e) => handleConfigChange('orderCutoffTime', e.target.value)}
                className="input-field"
              />
              <span className="field-hint">Orders placed after this time will be processed next day</span>
            </div>

            <div className="form-field">
              <label htmlFor="minDays">Minimum Delivery Lead Time (days)</label>
              <input
                type="number"
                id="minDays"
                value={config.minDeliveryDays}
                onChange={(e) => handleConfigChange('minDeliveryDays', parseInt(e.target.value))}
                className="input-field"
                min="1"
              />
              <span className="field-hint">Minimum days required between order and delivery</span>
            </div>
          </div>
        </div>

        <div className="config-section">
          <div className="section-header">
            <h2>Employee Rules</h2>
            <p className="section-desc">Set working hours and trip limits</p>
          </div>
          
          <div className="config-form">
            <div className="form-field">
              <label htmlFor="maxHours">Maximum Weekly Hours</label>
              <input
                type="number"
                id="maxHours"
                value={config.maxDriverHours}
                onChange={(e) => handleConfigChange('maxDriverHours', parseInt(e.target.value))}
                className="input-field"
                min="1"
                max="60"
              />
              <span className="field-hint">Maximum hours a driver can work per week</span>
            </div>

            <div className="form-field">
              <label htmlFor="maxTrips">Maximum Consecutive Trips</label>
              <input
                type="number"
                id="maxTrips"
                value={config.maxConsecutiveTrips}
                onChange={(e) => handleConfigChange('maxConsecutiveTrips', parseInt(e.target.value))}
                className="input-field"
                min="1"
              />
              <span className="field-hint">Maximum trips without rest period</span>
            </div>
          </div>
        </div>

        <div className="config-section">
          <div className="section-header">
            <h2>Capacity Settings</h2>
            <p className="section-desc">Configure vehicle capacity limits</p>
          </div>
          
          <div className="config-form">
            <div className="form-field">
              <label htmlFor="trainCap">Train Capacity (units)</label>
              <input
                type="number"
                id="trainCap"
                value={config.trainCapacity}
                onChange={(e) => handleConfigChange('trainCapacity', parseInt(e.target.value))}
                className="input-field"
                min="1"
              />
              <span className="field-hint">Maximum units per train trip</span>
            </div>

            <div className="form-field">
              <label htmlFor="truckCap">Truck Capacity (units)</label>
              <input
                type="number"
                id="truckCap"
                value={config.truckCapacity}
                onChange={(e) => handleConfigChange('truckCapacity', parseInt(e.target.value))}
                className="input-field"
                min="1"
              />
              <span className="field-hint">Maximum units per truck</span>
            </div>
          </div>
        </div>

        <div className="config-section">
          <div className="section-header">
            <h2>Notification Settings</h2>
            <p className="section-desc">Configure system notifications</p>
          </div>
          
          <div className="config-form">
            <div className="toggle-field">
              <div className="toggle-info">
                <label>Email Notifications</label>
                <span className="field-hint">Send email alerts for important events</span>
              </div>
              <input type="checkbox" className="toggle-input" defaultChecked />
            </div>

            <div className="toggle-field">
              <div className="toggle-info">
                <label>SMS Notifications</label>
                <span className="field-hint">Send SMS for urgent alerts</span>
              </div>
              <input type="checkbox" className="toggle-input" defaultChecked />
            </div>

            <div className="toggle-field">
              <div className="toggle-info">
                <label>Push Notifications</label>
                <span className="field-hint">Mobile app push notifications</span>
              </div>
              <input type="checkbox" className="toggle-input" defaultChecked />
            </div>
          </div>
        </div>
      </div>

      <div className="config-actions">
        <button className="btn-secondary">Reset to Defaults</button>
        <button className="btn-primary" onClick={handleSave}>
          Save Configuration
        </button>
      </div>
    </div>
  )
}

export default SystemConfig
