import './AssistantPortal.css'

function AssistantPortal() {
  const assignment = {
    driver: 'John Silva',
    orderId: 'ORD004',
    customerName: 'Graham Hills',
    address: '123, Main Street, Colombo 07',
  }

  return (
    <div className="assistant-portal">
      <div className="page-header">
        <h1>Assistant Dashboard</h1>
      </div>

      <div className="assignment-card">
        <div className="card-header">
          <h2>Current Assignment</h2>
        </div>
        <div className="assignment-details">
          <div className="detail-item">
            <div className="detail-label">Assigned Driver:</div>
            <div className="detail-value">{assignment.driver}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Order ID:</div>
            <div className="detail-value">{assignment.orderId}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Customer:</div>
            <div className="detail-value">{assignment.customerName}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Address:</div>
            <div className="detail-value">{assignment.address}</div>
          </div>
        </div>
        <div className="card-actions">
          <button className="btn-primary">View My Assignments</button>
        </div>
      </div>
    </div>
  )
}

export default AssistantPortal
