import { useState, useEffect, useCallback } from 'react'
import './ManagerDashboard.css'
import apiFetch from '../../utils/api'
import { useWebSocket } from '../../hooks/useWebSocket'

// Define interfaces for our data structures
interface TrainTrip {
  id: number
  departureCity: string
  arrivalCity: string
  departureDateTime: string
  totalCapacity: number
}

interface Delivery {
  id: number
  status: string
}

interface Order {
  id: number
  status: string
}

interface Employee {
  id: number
  type: string
}

interface TrainSchedule {
  trainTripId: number
  orderId: number
  allocatedSpace: number
}

interface Stat {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
  icon: string
}

function ManagerDashboard() {
  const [stats, setStats] = useState<Stat[]>([])
  const [trainUtilization, setTrainUtilization] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveAlerts, setLiveAlerts] = useState<any[]>([])
  const [serverAlerts, setServerAlerts] = useState<{ capacity_full_trips: any[]; roster_conflicts: any[] } | null>(null)

  // Mock data for alerts, to be replaced by WebSocket implementation
  const highPriorityAlerts = [
    { type: 'error', message: 'Truck #102: Engine temperature high', time: '5 mins ago' },
    { type: 'warning', message: 'Train Trip #56: Nearing capacity limit', time: '25 mins ago' },
    { type: 'info', message: 'Route #7: Road closure reported', time: '1 hour ago' },
  ]

  const combinedAlerts = [...(serverAlerts?.capacity_full_trips?.map((t: any) => ({ type: 'warning', message: `Trip ${t.train_trip_id} full: ${t.departure_city} → ${t.arrival_city}`, time: t.departure_date_time })) ?? []), ...liveAlerts, ...highPriorityAlerts]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all necessary data in parallel
        const [
          trainTripsRes,
          deliveriesRes,
          ordersRes,
          employeesRes,
          trainSchedulesRes,
          alertsRes,
        ] = await Promise.all([
          // backend A: train trips are at /train-trips/train-trips
          apiFetch('/train-trips/train-trips'),
          // deliveries on backend A
          apiFetch('/deliveries/deliveries'),
          // orders on backend B
          apiFetch('/orders'),
          // employees on backend B
          apiFetch('/employees'),
          // train schedules from backend A
          apiFetch('/train-trips/train-schedules'),
          // alerts from backend A
          apiFetch('/report/alerts'),
        ])

        // Check for errors in responses
        if (
          !trainTripsRes.ok ||
          !deliveriesRes.ok ||
          !ordersRes.ok ||
          !employeesRes.ok ||
          !trainSchedulesRes.ok ||
          !alertsRes.ok
        ) {
          throw new Error('Failed to fetch dashboard data')
        }

        // Parse JSON data
  // backend returns train trips as arrays (id, departure, arrival) in some branches, normalize
  const rawTrips = await trainTripsRes.json()
  const trainTrips: TrainTrip[] = (rawTrips || []).map((t: any) => ({
    id: t.train_trip_id ?? t.id ?? t[0],
    departureCity: t.departure_city ?? t.departureCity ?? t[1] ?? 'Unknown',
    arrivalCity: t.arrival_city ?? t.arrivalCity ?? t[2] ?? 'Unknown',
    departureDateTime: t.departure_date_time ?? t.departureDateTime ?? new Date().toISOString(),
    totalCapacity: t.total_capacity ?? t.totalCapacity ?? 1000,
  }))
  const deliveries: Delivery[] = await deliveriesRes.json()
  const orders: Order[] = await ordersRes.json()
  // employees endpoint from backend B returns { employee_id, firstName, lastName, type }
  const rawEmployees = await employeesRes.json()
  const employees: Employee[] = (rawEmployees || []).map((e: any) => ({ id: e.employee_id ?? e.id ?? e[0], type: e.type ?? e.role ?? 'staff' }))
  const rawSchedules = await trainSchedulesRes.json()
  const trainSchedules: TrainSchedule[] = (rawSchedules || []).map((s: any) => ({
    trainTripId: s.train_trip_id ?? s.trainTripId ?? s[0],
    orderId: s.order_id ?? s.orderId ?? s[1],
    allocatedSpace: Number(s.allocated_space ?? s.allocatedSpace ?? s[2] ?? 0),
  }))

        // Process data to calculate stats
        const ongoingTrainTrips = trainTrips.filter(
          (trip) => new Date(trip.departureDateTime) > new Date()
        ).length
        const trucksOnRoute = deliveries.filter(
          (delivery) => delivery.status === 'In Transit'
        ).length
        const pendingOrders = orders.filter(
          (order) => order.status === 'Pending'
        ).length
        const totalStaff = employees.length
        // Assuming 'available' staff is just the total for now
        const staffAvailability = totalStaff > 0 ? '100%' : '0%'

        const newStats: Stat[] = [
          {
            label: 'Ongoing Train Trips',
            value: ongoingTrainTrips,
            icon: '🚂',
          },
          { label: 'Trucks on Route', value: trucksOnRoute, icon: '🚛' },
          { label: 'Pending Orders', value: pendingOrders, icon: '📦' },
          {
            label: 'Staff Availability',
            value: staffAvailability,
            icon: '👥',
          },
        ]
        setStats(newStats)

        // Process train utilization data
        const utilizationData = trainTrips.map((trip) => {
          const scheduledOrders = trainSchedules.filter(
            (schedule) => schedule.trainTripId === trip.id
          )
          const usedCapacity = scheduledOrders.reduce(
            (acc, cur) => acc + cur.allocatedSpace,
            0
          )
          const utilizationPercentage =
            (usedCapacity / trip.totalCapacity) * 100
          return {
            label: `Trip #${trip.id} (${trip.departureCity} → ${trip.arrivalCity})`,
            value: utilizationPercentage.toFixed(0),
            max: 100,
            used: usedCapacity,
            total: trip.totalCapacity,
          }
        })
        setTrainUtilization(utilizationData)

        // alerts
        const alertsJson = await alertsRes.json()
        setServerAlerts(alertsJson)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // handle messages from websocket
  const onWsMessage = useCallback((msg: any) => {
    // insert new alert to top
    setLiveAlerts((prev) => [msg, ...prev].slice(0, 10))
  }, [])

  // subscribe to notifications websocket
  useWebSocket('/ws/notifications', onWsMessage)

  if (loading) return <div>Loading dashboard...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="manager-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Logistics Overview</h1>
        <button className="btn-primary">Today ▼</button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              {stat.change && (
                <div
                  className={`stat-change ${
                    stat.trend === 'up' ? 'positive' : 'negative'
                  }`}
                >
                  {stat.change} {stat.trend === 'up' ? '↗' : '↘'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="chart-card large">
          <div className="card-header">
            <h2>Daily Schedule Overview</h2>
            <select className="date-picker">
              <option>📅 Today</option>
            </select>
          </div>
          {/* This would be a timeline component in a real app */}
        </div>

        <div className="chart-card">
          <div className="card-header">
            <h2>High-Priority Alerts</h2>
          </div>
          <div className="alerts-list">
            {combinedAlerts.map((alert, index) => (
              <div key={index} className={`alert-item ${alert.type ?? 'info'}`}>
                <div className="alert-icon">
                  {alert.type === 'error' && '❌'}
                  {alert.type === 'warning' && '⚠️'}
                  {alert.type === 'info' && 'ℹ️'}
                </div>
                <div className="alert-content">
                  <div className="alert-message">{alert.message ?? JSON.stringify(alert)}</div>
                  <div className="alert-time">{alert.time ?? ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="system-stats">
        <h2>Train Capacity Utilization</h2>
        <div className="utilization-grid">
          {trainUtilization.map((stat, index) => (
            <div key={index} className="utilization-card">
              <div className="utilization-header">
                <span className="utilization-label">{stat.label}</span>
                <span className="utilization-value">{stat.value}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${stat.value}%` }}
                ></div>
              </div>
              <div className="utilization-meta">
                {stat.used} / {stat.total} capacity
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard