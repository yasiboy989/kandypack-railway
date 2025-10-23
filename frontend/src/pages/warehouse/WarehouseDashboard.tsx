import './WarehouseDashboard.css'
import { useEffect, useState } from 'react'
import { BoxesIcon, PackageIcon, AlertTriangleIcon, TrendingDownIcon } from '../../components/Icons'
import { getWarehouseManagerStats, type WarehouseManagerStats } from '../../lib/api'

function WarehouseDashboard() {
  const [stats, setStats] = useState<WarehouseManagerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadDashboardData = async () => {
      try {
        const data = await getWarehouseManagerStats()
        if (mounted) {
          setStats(data)
          console.log('Dashboard stats loaded:', data)
        }
      } catch (err) {
        if (mounted) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to load dashboard'
          setError(errorMsg)
          console.error('Failed to load warehouse dashboard:', err)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadDashboardData()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="warehouse-dashboard">
        <div style={{ padding: '24px', textAlign: 'center' }}>Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="warehouse-dashboard">
        <div className="dashboard-header">
          <h1 className="page-title">Warehouse Dashboard</h1>
          <p className="page-subtitle">Inventory Management & Stock Overview</p>
        </div>
        <div style={{ padding: '24px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: '1px solid #fecaca' }}>
          <strong>Error loading dashboard:</strong> {error}
          <div style={{ fontSize: '12px', marginTop: '8px' }}>Make sure the backend API is running and products are in the database.</div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="warehouse-dashboard">
        <div className="dashboard-header">
          <h1 className="page-title">Warehouse Dashboard</h1>
          <p className="page-subtitle">Inventory Management & Stock Overview</p>
        </div>
        <div style={{ padding: '24px', background: '#f0f9ff', color: '#1e40af', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          No data available. Please add products to the inventory.
        </div>
      </div>
    )
  }

  const statsCards = stats ? [
    {
      label: 'Total Products',
      value: stats.total_products.toLocaleString(),
      icon: BoxesIcon,
      color: 'blue'
    },
    {
      label: 'Total Units',
      value: stats.total_units.toLocaleString(),
      icon: PackageIcon,
      color: 'green'
    },
    {
      label: 'Low Stock Items',
      value: stats.low_stock_items.toLocaleString(),
      icon: AlertTriangleIcon,
      color: 'orange',
      highlight: stats.low_stock_items > 0
    }
  ] : []

  return (
    <div className="warehouse-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Warehouse Dashboard</h1>
        <p className="page-subtitle">Inventory Management & Stock Overview</p>
      </div>

      <div className="stats-grid">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div key={index} className={`stat-card ${stat.color} ${stat.highlight ? 'highlight' : ''}`}>
              <div className="stat-header">
                <span className="stat-icon">
                  <IconComponent size={28} />
                </span>
                <span className="stat-label">{stat.label}</span>
              </div>
              <div className="stat-value">{stat.value}</div>
            </div>
          )
        })}
      </div>

      <div className="dashboard-grid">
        {/* Recent Stock Updates */}
        <div className="card large">
          <div className="card-header">
            <h2>Recent Stock Updates</h2>
          </div>
          <div className="updates-list">
            {stats?.recent_updates && stats.recent_updates.length > 0 ? (
              stats.recent_updates.map((update, idx) => (
                <div key={idx} className="update-item">
                  <div className="update-info">
                    <div className="product-name">{update.product_name}</div>
                    <div className="product-meta">
                      <span className="category">{update.category}</span>
                      <span className="timestamp">{update.last_updated}</span>
                    </div>
                  </div>
                  <div className={`units-badge ${update.available_units < 50 ? 'low' : 'normal'}`}>
                    {update.available_units} units
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No recent updates</div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card large">
          <div className="card-header">
            <h2>Stock by Category</h2>
          </div>
          <div className="category-list">
            {stats?.category_distribution && stats.category_distribution.length > 0 ? (
              stats.category_distribution.map((cat, idx) => (
                <div key={idx} className="category-item">
                  <div className="category-info">
                    <div className="cat-name">{cat.category || 'Uncategorized'}</div>
                    <div className="cat-meta">{cat.product_count} products</div>
                  </div>
                  <div className="cat-units">{cat.total_units.toLocaleString()} units</div>
                </div>
              ))
            ) : (
              <div className="empty-state">No category data</div>
            )}
          </div>
        </div>

        {/* Stock Trend */}
        <div className="card full-width">
          <div className="card-header">
            <h2>Stock Activity (Last 30 Days)</h2>
          </div>
          <div className="trend-container">
            {stats?.stock_trend && stats.stock_trend.length > 0 ? (
              <div className="trend-data">
                {stats.stock_trend.slice(0, 15).map((item, idx) => (
                  <div key={idx} className="trend-item">
                    <span className="trend-date">{item.date}</span>
                    <span className="trend-value">{item.issued_units} issued</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No trend data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WarehouseDashboard
