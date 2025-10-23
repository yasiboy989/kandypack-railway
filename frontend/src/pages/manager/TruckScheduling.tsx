import { TruckIcon } from '../../components/Icons'

function TruckScheduling() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 className="page-title">Truck Scheduling</h1>
      <p className="page-subtitle">Manage truck routes, assign drivers and assistants</p>
      <div style={{ marginTop: '32px', padding: '40px', background: 'var(--secondary-color-1)', borderRadius: '12px', textAlign: 'center' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <TruckIcon size={48} />
        </div>
        <p style={{ color: 'var(--neutral-400)' }}>Truck scheduling interface with map view and driver assignment</p>
      </div>
    </div>
  )
}

export default TruckScheduling
