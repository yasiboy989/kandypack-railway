import { useState } from 'react'
import './ReportsCenter.css'

function ReportsCenter() {
  const [selectedReport, setSelectedReport] = useState<string>('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const reports = [
    {
      category: 'Sales Reports',
      items: [
        { id: 'quarterly', name: 'Quarterly Sales Report', icon: '📊' },
        { id: 'city', name: 'Sales by City', icon: '🏙️' },
        { id: 'route', name: 'Sales by Route', icon: '🗺️' },
        { id: 'customer', name: 'Customer Analysis', icon: '👥' },
      ]
    },
    {
      category: 'Operations Reports',
      items: [
        { id: 'driver-hours', name: 'Driver/Assistant Hours', icon: '⏱️' },
        { id: 'truck-usage', name: 'Truck Usage per Month', icon: '🚛' },
        { id: 'train-usage', name: 'Train Utilization', icon: '🚂' },
        { id: 'delivery-status', name: 'Delivery Status Report', icon: '📦' },
      ]
    },
    {
      category: 'Financial Reports',
      items: [
        { id: 'revenue', name: 'Revenue Report', icon: '💰' },
        { id: 'expenses', name: 'Expense Analysis', icon: '💸' },
        { id: 'profit', name: 'Profit & Loss', icon: '📈' },
        { id: 'invoice', name: 'Invoice History', icon: '🧾' },
      ]
    }
  ]

  const recentReports = [
    { name: 'Q4 2024 Sales Report', date: '2024-12-30', type: 'PDF', size: '2.4 MB' },
    { name: 'December Driver Hours', date: '2024-12-28', type: 'CSV', size: '156 KB' },
    { name: 'Truck Usage November', date: '2024-12-01', type: 'XLSX', size: '890 KB' },
    { name: 'Revenue Report Q3', date: '2024-10-15', type: 'PDF', size: '1.8 MB' },
  ]

  const handleGenerateReport = () => {
    if (!selectedReport) {
      alert('Please select a report type')
      return
    }
    console.log('Generating report:', selectedReport, dateRange)
    alert('Report generation started. You will receive an email when it\'s ready.')
  }

  const handleExport = (format: string) => {
    console.log('Exporting as:', format)
    alert(`Exporting report as ${format}...`)
  }

  return (
    <div className="reports-center">
      <div className="reports-header">
        <div>
          <h1 className="page-title">Reports Center</h1>
          <p className="page-subtitle">Generate and download comprehensive reports</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => handleExport('CSV')}>
            Export CSV
          </button>
          <button className="btn-primary" onClick={() => handleExport('PDF')}>
            Export PDF
          </button>
        </div>
      </div>

      <div className="reports-content">
        <div className="reports-sidebar">
          <div className="report-categories">
            {reports.map((category, idx) => (
              <div key={idx} className="category-section">
                <h3 className="category-title">{category.category}</h3>
                <div className="category-items">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      className={`report-item ${selectedReport === item.id ? 'active' : ''}`}
                      onClick={() => setSelectedReport(item.id)}
                    >
                      <span className="report-icon">{item.icon}</span>
                      <span className="report-name">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reports-main">
          <div className="report-generator">
            <h2>Generate New Report</h2>
            
            {selectedReport ? (
              <div className="generator-form">
                <div className="form-group">
                  <label>Report Type</label>
                  <div className="selected-report">
                    {reports.flatMap(c => c.items).find(i => i.id === selectedReport)?.name}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="start-date">Start Date</label>
                    <input
                      type="date"
                      id="start-date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="end-date">End Date</label>
                    <input
                      type="date"
                      id="end-date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Export Format</label>
                  <div className="format-options">
                    <button className="format-btn active">PDF</button>
                    <button className="format-btn">CSV</button>
                    <button className="format-btn">XLSX</button>
                  </div>
                </div>

                <button className="btn-primary btn-generate" onClick={handleGenerateReport}>
                  Generate Report →
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <p>Select a report type from the left to get started</p>
              </div>
            )}
          </div>

          <div className="recent-reports">
            <div className="recent-header">
              <h2>Recent Reports</h2>
              <button className="btn-link">View All</button>
            </div>

            <div className="reports-list">
              {recentReports.map((report, idx) => (
                <div key={idx} className="report-card">
                  <div className="report-info">
                    <div className="report-icon-large">📄</div>
                    <div className="report-details">
                      <div className="report-title">{report.name}</div>
                      <div className="report-meta">
                        <span>{report.date}</span>
                        <span>•</span>
                        <span>{report.type}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="report-actions">
                    <button className="btn-icon" title="Download">
                      ⬇️
                    </button>
                    <button className="btn-icon" title="Share">
                      🔗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsCenter
