import { useEffect, useState } from 'react'
import apiFetch from '../../utils/api'
import './Employees.css'

type Employee = {
  id: number
  name: string
  role: 'driver' | 'assistant' | 'manager'
  email?: string
  hours_worked_week?: number
  phone?: string
}

function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Employee | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      // backend B exposes /employees
      const res = await apiFetch('/employees')
      if (!res.ok) throw new Error('Failed to fetch employees')
      const raw = await res.json()
      const data = (raw || []).map((r: any) => ({ id: r.employee_id ?? r.id ?? r[0], name: `${r.firstName ?? r.name ?? ''} ${r.lastName ?? ''}`.trim(), role: (r.type ?? r.role ?? 'staff'), email: r.email, phone: r.phone, hours_worked_week: r.hours_worked_week }))
      setEmployees(data)
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading employees...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>Employees</h1>
      </div>

      <div className="employees-table-container">
        <table className="employees-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Hours (wk)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.name}</td>
                <td>{e.role}</td>
                <td>{e.email ?? '-'}</td>
                <td>{e.hours_worked_week ?? 0}</td>
                <td>
                  <button className="btn-icon" onClick={() => setSelected(e)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.name}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Role:</strong> {selected.role}</p>
              <p><strong>Email:</strong> {selected.email}</p>
              <p><strong>Phone:</strong> {selected.phone}</p>
              <p><strong>Hours this week:</strong> {selected.hours_worked_week}</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees
