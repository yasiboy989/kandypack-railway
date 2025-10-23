import './TrainScheduling.css'

function TrainScheduling() {
  const trips = [
    { id: 'T-145', route: 'City A → City B', date: '2025-01-05', capacity: 100, used: 85, orders: 12 },
    { id: 'T-146', route: 'City C → City D', date: '2025-01-06', capacity: 100, used: 92, orders: 15 },
    { id: 'T-147', route: 'City A → City D', date: '2025-01-07', capacity: 100, used: 45, orders: 6 },
  ]

  return (
    <div className="train-scheduling">
      <div className="page-header">
        <div>
          <h1 className="page-title">Train Scheduling</h1>
          <p className="page-subtitle">Manage train trips and allocate orders to available capacity</p>
        </div>
        <button className="btn-primary">Schedule New Trip</button>
      </div>

      <div className="calendar-view">
        <div className="calendar-header">
          <button className="btn-nav">← Previous Week</button>
          <h2>January 2025 - Week 1</h2>
          <button className="btn-nav">Next Week →</button>
        </div>

        <div className="trips-grid">
          {trips.map(trip => (
            <div key={trip.id} className="trip-card">
              <div className="trip-header">
                <span className="trip-id">{trip.id}</span>
                <span className={`badge ${trip.used > 90 ? 'badge-red' : trip.used > 70 ? 'badge-yellow' : 'badge-green'}`}>
                  {trip.used}% Full
                </span>
              </div>

              <div className="trip-details">
                <div className="detail-item">
                  <span className="label">Route:</span>
                  <span className="value">{trip.route}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Date:</span>
                  <span className="value">{trip.date}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Capacity:</span>
                  <span className="value">{trip.used}/{trip.capacity} units</span>
                </div>
                <div className="detail-item">
                  <span className="label">Orders:</span>
                  <span className="value">{trip.orders}</span>
                </div>
              </div>

              <div className="capacity-bar-large">
                <div className="capacity-fill" style={{ width: `${trip.used}%` }}></div>
              </div>

              <div className="trip-actions">
                <button className="btn-secondary-small">View Details</button>
                <button className="btn-secondary-small">Allocate Orders</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="unallocated-orders">
        <h2>Unallocated Orders</h2>
        <div className="orders-count">
          <span className="count">15</span>
          <span className="text">orders waiting for train allocation</span>
        </div>
        <button className="btn-primary">Review Orders</button>
      </div>
    </div>
  )
}

export default TrainScheduling
