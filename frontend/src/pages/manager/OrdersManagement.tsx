function OrdersManagement() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 className="page-title">Orders Management</h1>
      <p className="page-subtitle">Review, approve, and schedule pending orders</p>
      <div style={{ marginTop: '32px', padding: '40px', background: 'var(--secondary-color-1)', borderRadius: '12px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
        <p style={{ color: 'var(--neutral-400)' }}>Orders management interface with approve/reject/schedule actions</p>
      </div>
    </div>
  )
}

export default OrdersManagement
