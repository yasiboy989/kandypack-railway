import { ReportsIcon } from '../../components/Icons'

function ManagerReports() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 className="page-title">Performance Reports</h1>
      <p className="page-subtitle">On-time delivery rates and route performance metrics</p>
      <div style={{ marginTop: '32px', padding: '40px', background: 'var(--secondary-color-1)', borderRadius: '12px', textAlign: 'center' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <ReportsIcon size={48} />
        </div>
        <p style={{ color: 'var(--neutral-400)' }}>Performance reports and analytics dashboard</p>
      </div>
    </div>
  )
}

export default ManagerReports
