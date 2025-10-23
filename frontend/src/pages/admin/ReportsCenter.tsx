import { useState, useEffect } from 'react'
import './ReportsCenter.css'
import {
  MoneyIcon,
  PackageIcon,
  TimerIcon,
  TrainIcon,
} from '../../components/Icons'
import {
  getRevenueAnalysis,
  getProductPerformance,
  getTrainCapacityUtilization,
  getDeliveryPerformance,
  getEmployeeWorkload,
  getInventoryAlerts,
  type RevenueAnalysis,
  type ProductPerformance,
  type TrainCapacityUtilization,
  type DeliveryPerformance,
  type EmployeeWorkload,
  type InventoryAlert,
} from '../../lib/api'

type ReportType = 'revenue' | 'product' | 'train' | 'delivery' | 'employee' | 'inventory'
type ReportItem = { id: ReportType; name: string; icon: React.ComponentType<{ size?: number; className?: string }> }
type ReportCategory = { category: string; items: ReportItem[] }

function ReportsCenter() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('revenue')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Report data
  const [revenueData, setRevenueData] = useState<RevenueAnalysis[]>([])
  const [productData, setProductData] = useState<ProductPerformance[]>([])
  const [trainData, setTrainData] = useState<TrainCapacityUtilization[]>([])
  const [deliveryData, setDeliveryData] = useState<DeliveryPerformance[]>([])
  const [employeeData, setEmployeeData] = useState<EmployeeWorkload[]>([])
  const [inventoryData, setInventoryData] = useState<InventoryAlert[]>([])

  const reports: ReportCategory[] = [
    {
      category: 'Financial Reports',
      items: [
        { id: 'revenue' as const, name: 'Revenue Analysis', icon: MoneyIcon },
        { id: 'product' as const, name: 'Product Performance', icon: PackageIcon },
      ]
    },
    {
      category: 'Operations Reports',
      items: [
        { id: 'train' as const, name: 'Train Capacity Utilization', icon: TrainIcon },
        { id: 'delivery' as const, name: 'Delivery Performance', icon: PackageIcon },
        { id: 'employee' as const, name: 'Employee Workload', icon: TimerIcon },
      ]
    },
    {
      category: 'Inventory Reports',
      items: [
        { id: 'inventory' as const, name: 'Inventory Alerts', icon: PackageIcon },
      ]
    }
  ]

  useEffect(() => {
    loadReportData(selectedReport)
  }, [selectedReport])

  const loadReportData = async (reportType: ReportType) => {
    setLoading(true)
    setError('')
    try {
      switch (reportType) {
        case 'revenue':
          const revenue = await getRevenueAnalysis()
          setRevenueData(revenue)
          break
        case 'product':
          const products = await getProductPerformance()
          setProductData(products)
          break
        case 'train':
          const trains = await getTrainCapacityUtilization()
          setTrainData(trains)
          break
        case 'delivery':
          const deliveries = await getDeliveryPerformance()
          setDeliveryData(deliveries)
          break
        case 'employee':
          const employees = await getEmployeeWorkload()
          setEmployeeData(employees)
          break
        case 'inventory':
          const inventory = await getInventoryAlerts()
          setInventoryData(inventory)
          break
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (format: 'csv' | 'pdf') => {
    console.log(`Downloading ${selectedReport} report as ${format}`)
    // TODO: Implement actual download functionality
    alert(`Downloading ${selectedReport} report as ${format}...`)
  }

  const renderRevenueReport = () => (
    <div className="report-table-wrapper">
      <table className="report-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Customer Type</th>
            <th>Orders</th>
            <th>Total Revenue</th>
            <th>Avg Order Value</th>
            <th>Unique Customers</th>
          </tr>
        </thead>
        <tbody>
          {revenueData.map((row, idx) => (
            <tr key={idx}>
              <td>{row.month ? new Date(row.month).toLocaleDateString() : 'N/A'}</td>
              <td>{row.customer_type}</td>
              <td className="text-center">{row.order_count}</td>
              <td className="currency">${row.total_revenue.toFixed(2)}</td>
              <td className="currency">${row.avg_order_value.toFixed(2)}</td>
              <td className="text-center">{row.unique_customers}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderProductReport = () => (
    <div className="report-table-wrapper">
      <table className="report-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Unit Price</th>
            <th>Qty Sold</th>
            <th>Total Revenue</th>
            <th>Orders</th>
            <th>Stock Status</th>
          </tr>
        </thead>
        <tbody>
          {productData.map((row, idx) => (
            <tr key={idx}>
              <td>{row.product_name}</td>
              <td>{row.category}</td>
              <td className="currency">${row.unit_price.toFixed(2)}</td>
              <td className="text-center">{row.total_quantity_sold}</td>
              <td className="currency">${row.total_revenue.toFixed(2)}</td>
              <td className="text-center">{row.order_count}</td>
              <td>
                <span className={`badge badge-${row.stock_status === 'In Stock' ? 'success' : row.stock_status === 'Low Stock' ? 'warning' : 'error'}`}>
                  {row.stock_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderTrainReport = () => (
    <div className="report-table-wrapper">
      <table className="report-table">
        <thead>
          <tr>
            <th>Trip ID</th>
            <th>Route</th>
            <th>Departure</th>
            <th>Total Capacity</th>
            <th>Used Capacity</th>
            <th>Utilization %</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {trainData.map((row, idx) => (
            <tr key={idx}>
              <td>T-{row.train_trip_id}</td>
              <td>{row.departure_city} → {row.arrival_city}</td>
              <td>{new Date(row.departure_date_time).toLocaleDateString()}</td>
              <td className="text-center">{row.total_capacity}</td>
              <td className="text-center">{row.used_capacity}</td>
              <td className="text-center">
                <div className="utilization-bar">
                  <div className="utilization-fill" style={{ width: `${Math.min(row.utilization_percent, 100)}%` }}></div>
                  <span>{row.utilization_percent.toFixed(1)}%</span>
                </div>
              </td>
              <td className="text-center">{row.orders_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderDeliveryReport = () => (
    <div className="report-table-wrapper">
      <table className="report-table">
        <thead>
          <tr>
            <th>Delivery ID</th>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Performance</th>
            <th>Delivery Date</th>
            <th>Hours Delay</th>
          </tr>
        </thead>
        <tbody>
          {deliveryData.map((row, idx) => (
            <tr key={idx}>
              <td>D-{row.delivery_id}</td>
              <td>#{row.order_id}</td>
              <td>{row.customer_name}</td>
              <td>
                <span className={`badge badge-${row.status === 'Delivered' ? 'success' : row.status === 'In Transit' ? 'info' : 'warning'}`}>
                  {row.status}
                </span>
              </td>
              <td>
                <span className={`badge badge-${row.performance_status === 'On Time' ? 'success' : row.performance_status === 'Late' ? 'error' : 'warning'}`}>
                  {row.performance_status}
                </span>
              </td>
              <td>{new Date(row.delivery_date_time).toLocaleDateString()}</td>
              <td className="text-center">{row.hours_delay ? row.hours_delay.toFixed(1) : '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderEmployeeReport = () => (
    <div className="report-table-wrapper">
      <table className="report-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Type</th>
            <th>Total Assignments</th>
            <th>Total Hours</th>
            <th>Avg Hours/Assignment</th>
            <th>This Week</th>
            <th>Last Assignment</th>
          </tr>
        </thead>
        <tbody>
          {employeeData.map((row, idx) => (
            <tr key={idx}>
              <td>{row.first_name} {row.last_name}</td>
              <td>{row.employee_type}</td>
              <td className="text-center">{row.total_assignments}</td>
              <td className="text-center">{row.total_hours.toFixed(1)}</td>
              <td className="text-center">{row.avg_hours_per_assignment.toFixed(1)}</td>
              <td className="text-center">{row.assignments_this_week}</td>
              <td>{row.last_assignment ? new Date(row.last_assignment).toLocaleDateString() : 'Never'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderInventoryReport = () => (
    <div className="report-table-wrapper">
      <table className="report-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Current Stock</th>
            <th>Alert Level</th>
            <th>Suggested Reorder</th>
          </tr>
        </thead>
        <tbody>
          {inventoryData.map((row, idx) => (
            <tr key={idx}>
              <td>{row.product_name}</td>
              <td>{row.category}</td>
              <td className="text-center">{row.available_units}</td>
              <td>
                <span className={`badge badge-${
                  row.alert_level === 'CRITICAL' ? 'error' : 
                  row.alert_level === 'HIGH' ? 'warning' : 
                  'info'
                }`}>
                  {row.alert_level}
                </span>
              </td>
              <td className="text-center">{row.suggested_reorder_point}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderReport = () => {
    if (loading) {
      return <div className="loading-state">Loading report data...</div>
    }

    if (error) {
      return <div className="error-state">Error: {error}</div>
    }

    switch (selectedReport) {
      case 'revenue':
        return revenueData.length > 0 ? renderRevenueReport() : <div className="empty-state">No revenue data available</div>
      case 'product':
        return productData.length > 0 ? renderProductReport() : <div className="empty-state">No product data available</div>
      case 'train':
        return trainData.length > 0 ? renderTrainReport() : <div className="empty-state">No train data available</div>
      case 'delivery':
        return deliveryData.length > 0 ? renderDeliveryReport() : <div className="empty-state">No delivery data available</div>
      case 'employee':
        return employeeData.length > 0 ? renderEmployeeReport() : <div className="empty-state">No employee data available</div>
      case 'inventory':
        return inventoryData.length > 0 ? renderInventoryReport() : <div className="empty-state">No inventory data available</div>
      default:
        return <div className="empty-state">Select a report</div>
    }
  }

  return (
    <div className="reports-center">
      <div className="reports-header">
        <div>
          <h1 className="page-title">Reports Center</h1>
          <p className="page-subtitle">View comprehensive reports and analytics</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => handleDownload('csv')}>
            Export CSV
          </button>
          <button className="btn-primary" onClick={() => handleDownload('pdf')}>
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
                  {category.items.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <button
                        key={item.id}
                        className={`report-item ${selectedReport === item.id ? 'active' : ''}`}
                        onClick={() => setSelectedReport(item.id)}
                      >
                        <span className="report-icon">
                          <IconComponent size={18} />
                        </span>
                        <span className="report-name">{item.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reports-main">
          <div className="report-viewer">
            <div className="report-header-info">
              <h2>{reports.flatMap((c) => c.items).find((i) => i.id === selectedReport)?.name}</h2>
              <p className="report-description">
                {selectedReport === 'revenue' && 'Revenue breakdown by customer type and time period'}
                {selectedReport === 'product' && 'Product sales performance and stock status'}
                {selectedReport === 'train' && 'Train capacity utilization and orders allocation'}
                {selectedReport === 'delivery' && 'Delivery performance metrics and timing analysis'}
                {selectedReport === 'employee' && 'Employee workload and hours tracking'}
                {selectedReport === 'inventory' && 'Inventory levels and reorder alerts'}
              </p>
            </div>

            {renderReport()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsCenter
