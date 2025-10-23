import { useEffect, useState } from 'react'
import { ReportsIcon } from '../../components/Icons'
import './ManagerReports.css'
import { getDeliveryPerformance, getDriverHoursReport, getTruckUsageReport, type DriverHoursReport, type TruckUsageReport } from '../../lib/api'

function ManagerReports() {
  const [truckUsage, setTruckUsage] = useState<TruckUsageReport[]>([])
  const [driverHours, setDriverHours] = useState<DriverHoursReport[]>([])
  const [deliveryPerf, setDeliveryPerf] = useState<any[]>([])

  useEffect(() => {
    getTruckUsageReport().then(setTruckUsage)
    getDriverHoursReport().then(setDriverHours)
    getDeliveryPerformance().then(setDeliveryPerf)
  }, [])

  return (
    <div className="manager-reports-page">
      <h1 className="page-title">Performance Reports</h1>
      <p className="page-subtitle manager-section-intro">On-time delivery rates and route performance metrics</p>

      <div className="reports-grid">
        <div className="report-card">
          <h3 className="report-title">Truck Usage</h3>
          <div className="report-list">
            {truckUsage.map(t => (
              <div key={t.truckId} className="report-row">
                <span>Truck #{t.truckId}</span>
                <span className="muted">{(t.usageRate * 100).toFixed(1)}%</span>
              </div>
            ))}
            {truckUsage.length === 0 && <div className="muted">No data</div>}
          </div>
        </div>

        <div className="report-card">
          <h3 className="report-title">Driver Hours</h3>
          <div className="report-list">
            {driverHours.map(d => (
              <div key={d.employeeId} className="report-row">
                <span>Employee #{d.employeeId}</span>
                <span className="muted">{d.totalHours.toFixed(1)} hrs</span>
              </div>
            ))}
            {driverHours.length === 0 && <div className="muted">No data</div>}
          </div>
        </div>

        <div className="report-card">
          <h3 className="report-title icon-title"><ReportsIcon size={18}/> Delivery Performance</h3>
          <div className="report-list">
            {deliveryPerf.slice(0, 8).map((r, idx) => (
              <div key={idx} className="report-row">
                <span>Order #{r.order_id} · {r.customer_name}</span>
                <span className="muted">{r.performance_status} · {r.hours_delay ?? 0}h</span>
              </div>
            ))}
            {deliveryPerf.length === 0 && <div className="muted">No data</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerReports
