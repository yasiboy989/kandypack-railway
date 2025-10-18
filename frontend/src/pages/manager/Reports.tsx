import './Reports.css'

function Reports() {
  const reports = [
    { title: 'Quarterly Sales Report', description: 'A summary of sales data for the last quarter.' },
    { title: 'Most Ordered Products', description: 'A list of the most popular products.' },
    { title: 'City-wise Sales Breakdown', description: 'Sales data broken down by city.' },
    { title: 'Driver & Assistant Hours', description: 'A summary of hours worked by drivers and assistants.' },
    { title: 'Truck Usage Report', description: 'An analysis of truck usage and efficiency.' },
    { title: 'Customer Order History', description: 'A detailed history of all customer orders.' },
  ]

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports</h1>
      </div>

      <div className="reports-list">
        {reports.map((report, index) => (
          <div key={index} className="report-card">
            <div className="report-info">
              <h2 className="report-title">{report.title}</h2>
              <p className="report-description">{report.description}</p>
            </div>
            <div className="report-actions">
              <button className="btn-primary">Generate</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Reports