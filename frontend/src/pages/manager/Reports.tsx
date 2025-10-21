import { useMemo, useState, useEffect } from 'react'
import apiFetch from '../../utils/api'
import './Reports.css'

function Reports() {
  // Core datasets for a logistics manager
  const [truckUsage, setTruckUsage] = useState<any[]>([])
  const [driverHours, setDriverHours] = useState<any[]>([])
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [alerts, setAlerts] = useState<{ capacity_full_trips: any[]; roster_conflicts: any[] } | null>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [trucks, setTrucks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [truckRes, driverRes, alertsRes, deliveriesRes, employeesRes, trucksRes] = await Promise.all([
          apiFetch('/report/truck_usage'),
          apiFetch('/report/driver-hours'),
          apiFetch('/report/alerts'),
          apiFetch('/deliveries/deliveries'),
          apiFetch('/employees'), // Backend-2 employees for names and roles
          apiFetch('/Trucks/trucks'),
        ])

        if (!alertsRes.ok) throw new Error('Failed to load alerts')

        // Parse with resilience to tuple-based rows
        const safeJson = async (res: any, fallback: any[] = []) => {
          try { return res.ok ? await res.json() : fallback } catch { return fallback }
        }

        const [tRaw, dRaw, aJson, delRaw, empRaw, trucksRaw] = await Promise.all([
          safeJson(truckRes),
          safeJson(driverRes),
          alertsRes.json(),
          safeJson(deliveriesRes),
          safeJson(employeesRes),
          safeJson(trucksRes),
        ])

        setAlerts(aJson)
        setDeliveries(delRaw)
        setEmployees((empRaw || []).map((e: any) => {
          const id = e.employee_id ?? e.id ?? (Array.isArray(e) ? e[0] : undefined)
          const first = e.firstName ?? e.first_name ?? (Array.isArray(e) ? e[1] : '')
          const last = e.lastName ?? e.last_name ?? (Array.isArray(e) ? e[2] : '')
          const name = (e.name ?? `${first} ${last}`.trim()) || `Emp ${id}`
          const roleRaw = (e.type ?? e.role ?? e.employee_type ?? '').toString().toLowerCase()
          const role = roleRaw.includes('driver') ? 'driver' : roleRaw.includes('assistant') ? 'assistant' : roleRaw || 'staff'
          const hours = e.hours_worked_week ?? e.totalHours ?? 0
          return { id, name, role, hours }
        }))
        setTrucks((trucksRaw || []).map((t: any) => ({
          id: t.truck_id ?? t.id ?? (Array.isArray(t) ? t[0] : undefined),
          plate: t.plate_number ?? t.plate ?? (Array.isArray(t) ? t[1] : `Truck ${t.truck_id ?? t.id}`),
          maxLoad: t.max_load ?? t.maxLoad ?? 0,
        })))

        // Normalize truck usage rows
        const normalizedTruckUsage = (tRaw || []).map((r: any) => ({
          truckId: r.truck_id ?? r.truckId ?? (Array.isArray(r) ? r[0] : undefined),
          usageRate: r.usage_rate ?? r.usageRate ?? r.utilization ?? (Array.isArray(r) ? r[1] : 0),
        }))
        setTruckUsage(normalizedTruckUsage)

        // Normalize driver hours rows (may include both drivers and assistants in some backends)
        const normalizedDriverHours = (dRaw || []).map((r: any) => ({
          employeeId: r.employee_id ?? r.employeeId ?? (Array.isArray(r) ? r[0] : undefined),
          totalHours: r.total_hours ?? r.totalHours ?? (Array.isArray(r) ? r[1] : 0),
        }))
        setDriverHours(normalizedDriverHours)
      } catch (err) {
        if (err instanceof Error) setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  if (loading) return <div>Loading reports...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports</h1>
      </div>
      {alerts && (
        <AlertsSummary capacityCount={alerts.capacity_full_trips?.length || 0} conflictCount={alerts.roster_conflicts?.length || 0} />
      )}

      <DeliveriesSummary deliveries={deliveries} />

      <div className="reports-list">
        <TruckUsage data={truckUsage} trucks={trucks} />
        <RosterHours data={driverHours} employees={employees} />
      </div>
    </div>
  )
}

export default Reports

function AlertsSummary({ capacityCount, conflictCount }: { capacityCount: number; conflictCount: number }) {
  return (
    <div className="kpi-cards">
      <div className="kpi-card">
        <div className="kpi-title">Capacity Full Trips</div>
        <div className="kpi-value">{capacityCount}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-title">Roster Conflicts</div>
        <div className="kpi-value warning">{conflictCount}</div>
      </div>
    </div>
  )
}

function TruckUsage({ data, trucks }: { data: Array<{ truckId: number; usageRate: number }>; trucks: Array<{ id: number; plate: string }> }) {
  const sorted = useMemo(() => (data || []).slice().sort((a, b) => (b.usageRate || 0) - (a.usageRate || 0)), [data])
  const truckLabel = (id: number) => trucks.find((t) => t.id == id)?.plate || `Truck ${id}`
  return (
    <div className="report-card">
      <div className="report-info">
        <div className="report-title">Fleet Utilization</div>
        <div className="report-description">Utilization of each truck</div>
        {sorted.length === 0 && <div className="empty">No truck usage data</div>}
        <div className="progress-list">
          {sorted.map((t) => (
            <div className="progress-row" key={t.truckId}>
              <div className="progress-label">{truckLabel(t.truckId)}</div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, (t.usageRate || 0) * 100))}%` }} />
              </div>
              <div className="progress-value">{Math.round((t.usageRate || 0) * 100)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RosterHours({ data, employees }: { data: Array<{ employeeId: number; totalHours: number }>; employees: Array<{ id: number; name: string; role: string; hours: number }> }) {
  // Merge hours with employees to include assistants and names
  const merged = useMemo(() => {
    const hoursMap = new Map<number, number>()
    for (const r of data || []) {
      if (r && r.employeeId != null) hoursMap.set(Number(r.employeeId), Number(r.totalHours || 0))
    }
    const rows = employees
      .filter((e) => e.role === 'driver' || e.role === 'assistant')
      .map((e) => ({
        id: e.id,
        name: e.name,
        role: e.role,
        totalHours: hoursMap.has(Number(e.id)) ? Number(hoursMap.get(Number(e.id))) : (e.hours ?? 0),
      }))
    rows.sort((a, b) => (b.totalHours || 0) - (a.totalHours || 0))
    return rows
  }, [data, employees])
  return (
    <div className="report-card">
      <div className="report-info full">
        <div className="report-title">Roster Hours</div>
        <div className="report-description">Total hours worked per driver and assistant</div>
        {merged.length === 0 ? (
          <div className="empty">No roster hours data</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {merged.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{d.role}</td>
                  <td>{Number(d.totalHours || 0).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function DeliveriesSummary({ deliveries }: { deliveries: any[] }) {
  const summary = useMemo(() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)) // Monday as start
    let today = 0
    let week = 0
    let pending = 0
    let delivered = 0
    for (const d of deliveries || []) {
      const status = (d.status ?? d.delivery_status ?? '').toString().toLowerCase()
      if (status.includes('delivered') || status === 'completed') delivered++
      if (!status || status === 'pending' || status === 'scheduled' || status === 'in-transit') pending++
      const tsStr = d.delivery_date_time ?? d.departure_time ?? d.date ?? d.created_at
      if (tsStr) {
        const ts = new Date(tsStr)
        if (ts >= startOfDay) today++
        if (ts >= startOfWeek) week++
      }
    }
    return { today, week, pending, delivered }
  }, [deliveries])
  return (
    <div className="kpi-cards">
      <div className="kpi-card">
        <div className="kpi-title">Deliveries Today</div>
        <div className="kpi-value">{summary.today}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-title">Deliveries This Week</div>
        <div className="kpi-value">{summary.week}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-title">Pending</div>
        <div className="kpi-value">{summary.pending}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-title">Delivered</div>
        <div className="kpi-value">{summary.delivered}</div>
      </div>
    </div>
  )
}