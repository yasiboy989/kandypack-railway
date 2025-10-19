import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MyAssignments.css'

interface Assignment {
  id: string
  customerName: string
  address: string
  status: 'pending' | 'in-transit' | 'delivered'
}

function MyAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: 'ORD004', customerName: 'Graham Hills', address: '123, Main Street, Colombo 07', status: 'in-transit' },
    { id: 'ORD005', customerName: 'Jane Doe', address: '456, Galle Road, Colombo 03', status: 'pending' },
    { id: 'ORD002', customerName: 'Sophie Moore', address: '789, Kandy Road, Kiribathgoda', status: 'delivered' },
  ])

  const navigate = useNavigate()

  const handleConfirmClick = (orderId: string) => {
    navigate(`/assistant/confirmation?orderId=${orderId}`)
  }

  return (
    <div className="my-assignments">
      <div className="page-header">
        <h1>My Assignments</h1>
        <div className="truck-assignment-info">
          <span>Assigned to Truck: <strong>T002</strong></span>
        </div>
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
              <p className="address">{assignment.address}</p>
            </div>
            <div className="card-actions">
              <button 
                className="btn-primary" 
                onClick={() => handleConfirmClick(assignment.id)}
              >
                Confirm Delivery
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAssignments