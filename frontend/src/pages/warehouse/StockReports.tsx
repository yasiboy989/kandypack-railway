import './StockReports.css'
import { useEffect, useState } from 'react'
import { DownloadIcon, AlertTriangleIcon } from '../../components/Icons'
import { getProductPerformance, getInventoryAlerts, type ProductPerformance, type InventoryAlert } from '../../lib/api'

type ReportTab = 'current' | 'low-stock'

function StockReports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('current')
  const [currentStock, setCurrentStock] = useState<ProductPerformance[]>([])
  const [lowStockItems, setLowStockItems] = useState<InventoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      setLoading(true)
      const [stockData, alertsData] = await Promise.all([
        getProductPerformance(),
        getInventoryAlerts()
      ])
      
      setCurrentStock(stockData)
      setLowStockItems(alertsData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export')
      return
    }

    setExporting(true)
    try {
      const headers = Object.keys(data[0])
      const csv = [
        headers.join(','),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header]
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`
            }
            return value
          }).join(',')
        )
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="reports-page">
        <div style={{ padding: '24px', textAlign: 'center' }}>Loading reports...</div>
      </div>
    )
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1 className="page-title">Stock Reports</h1>
          <p className="page-subtitle">Inventory analysis and stock alerts</p>
        </div>
        <button
          onClick={() => activeTab === 'current' && exportToCSV(currentStock, 'current-stock-report')}
          disabled={exporting || activeTab !== 'current'}
          className="export-btn"
          title="Export to CSV"
        >
          <DownloadIcon size={18} />
          Export CSV
        </button>
      </div>

      {error && <div className="alert error-alert">{error}</div>}

      <div className="tabs-container">
        <div className="tabs-header">
          <button
            className={`tab ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            Current Stock ({currentStock.length})
          </button>
          <button
            className={`tab ${activeTab === 'low-stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('low-stock')}
          >
            Low Stock Alerts ({lowStockItems.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'current' && (
            <div className="current-stock-tab">
              {currentStock.length > 0 ? (
                <div className="table-wrapper">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Current Stock</th>
                        <th>Price</th>
                        <th>Total Value</th>
                        <th>Sold Units</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStock.map(item => {
                        const stockStatus = item.current_stock === 0
                          ? 'out-of-stock'
                          : item.current_stock < 50
                          ? 'low'
                          : 'healthy'

                        const totalValue = (item.current_stock || 0) * (item.unit_price || 0)

                        return (
                          <tr key={item.product_id} className={`report-row ${stockStatus}`}>
                            <td className="product-col">
                              <div className="product-info">
                                <span className="product-name">{item.product_name}</span>
                              </div>
                            </td>
                            <td>{item.category || '-'}</td>
                            <td className="stock-col">
                              <span className={`stock-value ${stockStatus}`}>
                                {item.current_stock || 0}
                              </span>
                            </td>
                            <td className="price-col">
                              ${(item.unit_price || 0).toFixed(2)}
                            </td>
                            <td className="value-col">
                              ${totalValue.toFixed(2)}
                            </td>
                            <td className="center-col">
                              {item.total_quantity_sold || 0}
                            </td>
                            <td className="status-col">
                              <span className={`status-badge ${stockStatus}`}>
                                {stockStatus === 'out-of-stock' && 'Out of Stock'}
                                {stockStatus === 'low' && 'Low Stock'}
                                {stockStatus === 'healthy' && 'Healthy'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No stock data available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'low-stock' && (
            <div className="low-stock-tab">
              {lowStockItems.length > 0 ? (
                <div className="alerts-list">
                  {lowStockItems.map(alert => {
                    const isOrgasm = alert.alert_level === 'critical' ? 'critical' : 'warning'

                    return (
                      <div key={alert.product_id} className={`alert-card ${isOrgasm}`}>
                        <div className="alert-icon">
                          <AlertTriangleIcon size={24} />
                        </div>
                        <div className="alert-content">
                          <h3 className="alert-title">{alert.product_name}</h3>
                          <div className="alert-details">
                            <div className="detail-row">
                              <span className="label">Category:</span>
                              <span className="value">{alert.category || '-'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Current Units:</span>
                              <span className={`value ${isOrgasm}`}>
                                {alert.available_units}
                              </span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Suggested Reorder:</span>
                              <span className="value">{alert.suggested_reorder_point} units</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Alert Level:</span>
                              <span className={`level-badge ${isOrgasm}`}>
                                {alert.alert_level || 'warning'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">✓</div>
                  <p>No low stock alerts - inventory levels are healthy!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StockReports
