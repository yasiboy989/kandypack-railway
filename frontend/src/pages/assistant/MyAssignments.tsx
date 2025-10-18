import { useState } from 'react'
import './MyAssignments.css'

interface Assignment {
  id: string
  customerName: string
  status: 'pending' | 'in-transit' | 'delivered'
}

function MyAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: 'ORD004', customerName: 'Graham Hills', status: 'in-transit' },
    { id: 'ORD005', customerName: 'Jane Doe', status: 'pending' },
    { id: 'ORD002', customerName: 'Sophie Moore', status: 'delivered' },
  ])

  return (
    <div className="my-assignments">
      <div className="page-header">
        <h1>My Assignments</h1>
      </div>

      <div className="assignments-list">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="assignment-card">
            <div className="card-header">
              <h3>{assignment.customerName}</h3>
              <span className={`status-badge ${assignment.status}`}>
                {assignment.status}
              </span>
            </div>
            <div className="card-body">
              <p className="order-id">Order ID: {assignment.id}</p>
            </div>
            <div className="card-actions">
              <button className="btn-primary">Confirm Delivery</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAssignments