import { useState } from 'react'
import './TruckScheduling.css'

interface TruckRoute {
  id: string
  routeName: string
  truck: string
  driver: string
  assistant: string
  status: 'pending' | 'in-transit' | 'completed'
}

function TruckScheduling() {
  const [truckRoutes, setTruckRoutes] = useState<TruckRoute[]>([
    { id: 'TR001', routeName: 'North Colombo', truck: 'T001', driver: 'John Silva', assistant: 'Mike Perera', status: 'in-transit' },
    { id: 'TR002', routeName: 'South Kandy', truck: 'T002', driver: 'David Kumar', assistant: 'Sam Fernando', status: 'pending' },
    { id: 'TR003', routeName: 'Galle Express', truck: 'T003', driver: 'Peter Jayawardena', assistant: 'Nimal Bandara', status: 'completed' },
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [newRoute, setNewRoute] = useState({
    routeName: '',
    truck: '',
    driver: '',
    assistant: '',
  })

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault()
    const route: TruckRoute = {
      id: `TR${(truckRoutes.length + 1).toString().padStart(3, '0')}`,
      routeName: newRoute.routeName,
      truck: newRoute.truck,
      driver: newRoute.driver,
      assistant: newRoute.assistant,
      status: 'pending',
    }
    setTruckRoutes([...truckRoutes, route])
    setShowAddModal(false)
    setNewRoute({ routeName: '', truck: '', driver: '', assistant: '' })
  }

  return (
    <div className="truck-scheduling">
      <div className="page-header">
        <h1>Truck Scheduling</h1>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          + Add New Route
        </button>
      </div>

      <div className="filters-bar">
        <input type="text" placeholder="Search routes..." className="search-input" />
        <select className="filter-select">
          <option>All Statuses</option>
          <option>Pending</option>
          <option>In-transit</option>
          <option>Completed</option>
        </select>
      </div>

      <div className="routes-table-container">
        <table className="routes-table">
          <thead>
            <tr>
              <th>Route ID</th>
              <th>Route Name</th>
              <th>Truck</th>
              <th>Driver</th>
              <th>Assistant</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {truckRoutes.map((route) => (
              <tr key={route.id}>
                <td>{route.id}</td>
                <td>{route.routeName}</td>
                <td>{route.truck}</td>
                <td>{route.driver}</td>
                <td>{route.assistant}</td>
                <td>
                  <span className={`status-badge ${route.status}`}>
                    {route.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Edit">✏️</button>
                    <button className="btn-icon btn-danger" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Truck Route</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddRoute} className="modal-form">
              <div className="form-group">
                <label>Route Name</label>
                <input
                  type="text"
                  value={newRoute.routeName}
                  onChange={(e) => setNewRoute({ ...newRoute, routeName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>Truck</label>
                <input
                  type="text"
                  value={newRoute.truck}
                  onChange={(e) => setNewRoute({ ...newRoute, truck: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>Driver</label>
                <input
                  type="text"
                  value={newRoute.driver}
                  onChange={(e) => setNewRoute({ ...newRoute, driver: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>Assistant</label>
                <input
                  type="text"
                  value={newRoute.assistant}
                  onChange={(e) => setNewRoute({ ...newRoute, assistant: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TruckScheduling