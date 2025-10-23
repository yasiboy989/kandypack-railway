import './StockAlerts.css'
import { useEffect, useState } from 'react'
import { AlertTriangleIcon, AlertCircleIcon, CheckCircleIcon } from '../../components/Icons'
import { getInventoryAlerts, type InventoryAlert } from '../../lib/api'

function StockAlerts() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadAlerts()
    const interval = setInterval(loadAlerts, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadAlerts = async () => {
    try {
      const data = await getInventoryAlerts()
      setAlerts(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts')
      console.error('Failed to load alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  const dismissAlert = (productId: number) => {
    const newDismissed = new Set(dismissedAlerts)
    newDismissed.add(productId)
    setDismissedAlerts(newDismissed)
  }

  const clearAllDismissed = () => {
    setDismissedAlerts(new Set())
  }

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.product_id))
  const criticalAlerts = visibleAlerts.filter(a => a.alert_level === 'critical')
  const warningAlerts = visibleAlerts.filter(a => a.alert_level === 'warning' || !a.alert_level)
  const healthyCount = alerts.length - visibleAlerts.length

  if (loading && alerts.length === 0) {
    return (
      <div className="alerts-page">
        <div style={{ padding: '24px', textAlign: 'center' }}>Loading alerts...</div>
      </div>
    )
  }

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <div>
          <h1 className="page-title">Stock Alerts</h1>
          <p className="page-subtitle">Real-time inventory status notifications</p>
        </div>
        {dismissedAlerts.size > 0 && (
          <button onClick={clearAllDismissed} className="clear-btn">
            Clear Dismissed ({dismissedAlerts.size})
          </button>
        )}
      </div>

      {error && <div className="alert error-alert">{error}</div>}

      <div className="alerts-summary">
        <div className="summary-card critical-summary">
          <div className="summary-icon critical">
            <AlertTriangleIcon size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Critical Alerts</div>
            <div className="summary-value">{criticalAlerts.length}</div>
          </div>
          <div className="summary-description">Items need immediate attention</div>
        </div>

        <div className="summary-card warning-summary">
          <div className="summary-icon warning">
            <AlertCircleIcon size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Warnings</div>
            <div className="summary-value">{warningAlerts.length}</div>
          </div>
          <div className="summary-description">Items approaching low threshold</div>
        </div>

        <div className="summary-card healthy-summary">
          <div className="summary-icon healthy">
            <CheckCircleIcon size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Healthy</div>
            <div className="summary-value">{healthyCount}</div>
          </div>
          <div className="summary-description">Items with adequate stock</div>
        </div>
      </div>

      {visibleAlerts.length > 0 ? (
        <div className="alerts-container">
          {criticalAlerts.length > 0 && (
            <div className="alert-section">
              <h2 className="section-title critical-title">
                <AlertTriangleIcon size={18} />
                Critical Alerts ({criticalAlerts.length})
              </h2>
              <div className="alerts-grid">
                {criticalAlerts.map(alert => (
                  <AlertCard
                    key={alert.product_id}
                    alert={alert}
                    onDismiss={() => dismissAlert(alert.product_id)}
                  />
                ))}
              </div>
            </div>
          )}

          {warningAlerts.length > 0 && (
            <div className="alert-section">
              <h2 className="section-title warning-title">
                <AlertCircleIcon size={18} />
                Warnings ({warningAlerts.length})
              </h2>
              <div className="alerts-grid">
                {warningAlerts.map(alert => (
                  <AlertCard
                    key={alert.product_id}
                    alert={alert}
                    onDismiss={() => dismissAlert(alert.product_id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <h2>All Clear!</h2>
          <p>All inventory levels are healthy. No alerts at this time.</p>
          {dismissedAlerts.size > 0 && (
            <button onClick={clearAllDismissed} className="restore-btn">
              Restore Dismissed Alerts
            </button>
          )}
        </div>
      )}
    </div>
  )
}

interface AlertCardProps {
  alert: InventoryAlert
  onDismiss: () => void
}

function AlertCard({ alert, onDismiss }: AlertCardProps) {
  const isCritical = alert.alert_level === 'critical'
  const percentOfTarget = alert.suggested_reorder_point
    ? Math.round((alert.available_units / alert.suggested_reorder_point) * 100)
    : 0

  return (
    <div className={`alert-card ${isCritical ? 'critical' : 'warning'}`}>
      <div className="alert-header-bar"></div>
      <div className="alert-body">
        <div className="alert-main">
          <div className="alert-icon">
            {isCritical ? (
              <AlertTriangleIcon size={28} />
            ) : (
              <AlertCircleIcon size={28} />
            )}
          </div>

          <div className="alert-info">
            <h3 className="alert-product-name">{alert.product_name}</h3>
            <p className="alert-category">{alert.category || 'Uncategorized'}</p>

            <div className="alert-details">
              <div className="detail-row">
                <span className="detail-label">Current Stock:</span>
                <span className={`detail-value ${isCritical ? 'critical' : 'warning'}`}>
                  {alert.available_units} units
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reorder Point:</span>
                <span className="detail-value">
                  {alert.suggested_reorder_point} units
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Level:</span>
                <span className={`level-badge ${isCritical ? 'critical' : 'warning'}`}>
                  {alert.alert_level || 'Warning'}
                </span>
              </div>
            </div>

            <div className="stock-meter">
              <div className="meter-label">
                <span>Stock Level</span>
                <span className="percentage">{percentOfTarget}%</span>
              </div>
              <div className="meter-bar">
                <div
                  className={`meter-fill ${isCritical ? 'critical' : 'warning'}`}
                  style={{ width: `${Math.min(percentOfTarget, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="alert-actions">
          <button
            onClick={onDismiss}
            className="dismiss-btn"
            title="Dismiss this alert"
          >
            ×
          </button>
        </div>
      </div>

      <div className="alert-suggestion">
        <strong>Action:</strong> Consider reordering {Math.max(0, alert.suggested_reorder_point - alert.available_units)} units to reach target stock level.
      </div>
    </div>
  )
}

export default StockAlerts
