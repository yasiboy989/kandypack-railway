import { useState } from 'react'
import './AuditLogs.css'

function AuditLogs() {
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const logs = [
    {
      id: '1',
      timestamp: '2024-12-30 10:06:45',
      user: 'John Carter',
      role: 'Admin',
      action: 'User Created',
      target: 'New employee: Sarah Miller',
      type: 'create',
      ip: '192.168.1.45',
    },
    {
      id: '2',
      timestamp: '2024-12-30 09:45:22',
      user: 'Jane Smith',
      role: 'Manager',
      action: 'Order Scheduled',
      target: 'Order #1532 assigned to Route #45',
      type: 'update',
      ip: '192.168.1.67',
    },
    {
      id: '3',
      timestamp: '2024-12-30 09:30:15',
      user: 'Mike Johnson',
      role: 'Admin',
      action: 'User Deleted',
      target: 'Removed employee: Tom Wilson',
      type: 'delete',
      ip: '192.168.1.45',
    },
    {
      id: '4',
      timestamp: '2024-12-30 09:15:33',
      user: 'John Carter',
      role: 'Admin',
      action: 'Login',
      target: 'Successful authentication',
      type: 'login',
      ip: '192.168.1.45',
    },
    {
      id: '5',
      timestamp: '2024-12-30 08:50:11',
      user: 'Sarah Davis',
      role: 'Warehouse',
      action: 'Inventory Updated',
      target: 'Stock adjusted for Product #234',
      type: 'update',
      ip: '192.168.1.89',
    },
    {
      id: '6',
      timestamp: '2024-12-30 08:22:47',
      user: 'David Lee',
      role: 'Driver',
      action: 'Delivery Completed',
      target: 'Order #1529 marked as delivered',
      type: 'update',
      ip: '192.168.1.123',
    },
    {
      id: '7',
      timestamp: '2024-12-29 16:35:29',
      user: 'Emma Wilson',
      role: 'Customer',
      action: 'Order Placed',
      target: 'New order #1535 created',
      type: 'create',
      ip: '203.45.67.89',
    },
    {
      id: '8',
      timestamp: '2024-12-29 15:20:18',
      user: 'Mike Johnson',
      role: 'Admin',
      action: 'System Config Changed',
      target: 'Updated max driver hours to 40',
      type: 'update',
      ip: '192.168.1.45',
    },
  ]

  const actionTypes = [
    { value: 'all', label: 'All Actions', count: logs.length },
    { value: 'create', label: 'Create', count: logs.filter(l => l.type === 'create').length },
    { value: 'update', label: 'Update', count: logs.filter(l => l.type === 'update').length },
    { value: 'delete', label: 'Delete', count: logs.filter(l => l.type === 'delete').length },
    { value: 'login', label: 'Login', count: logs.filter(l => l.type === 'login').length },
  ]

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType
    const matchesSearch = searchTerm === '' ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesType && matchesSearch
  })

  const getActionColor = (type: string) => {
    switch (type) {
      case 'create': return 'badge-green'
      case 'delete': return 'badge-red'
      case 'update': return 'badge-yellow'
      case 'login': return 'badge-blue'
      default: return ''
    }
  }

  return (
    <div className="audit-logs">
      <div className="logs-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Track all system activities and user actions</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            Export Logs
          </button>
        </div>
      </div>

      <div className="logs-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tabs">
          {actionTypes.map((type) => (
            <button
              key={type.value}
              className={`filter-tab ${filterType === type.value ? 'active' : ''}`}
              onClick={() => setFilterType(type.value)}
            >
              {type.label}
              <span className="tab-count">{type.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="logs-table">
        <div className="table-header">
          <div className="th th-timestamp">Timestamp</div>
          <div className="th th-user">User</div>
          <div className="th th-action">Action</div>
          <div className="th th-target">Target/Details</div>
          <div className="th th-ip">IP Address</div>
        </div>

        <div className="table-body">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="table-row">
                <div className="td td-timestamp">
                  <div className="timestamp-value">{log.timestamp}</div>
                </div>
                <div className="td td-user">
                  <div className="user-info">
                    <div className="user-avatar-small">{log.user.charAt(0)}</div>
                    <div>
                      <div className="user-name-small">{log.user}</div>
                      <div className="user-role-small">{log.role}</div>
                    </div>
                  </div>
                </div>
                <div className="td td-action">
                  <span className={`badge ${getActionColor(log.type)}`}>
                    {log.action}
                  </span>
                </div>
                <div className="td td-target">
                  <div className="target-text">{log.target}</div>
                </div>
                <div className="td td-ip">
                  <div className="ip-text">{log.ip}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-logs">
              <div className="empty-icon">🔍</div>
              <p>No logs found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      <div className="logs-pagination">
        <button className="btn-page" disabled>
          ← Previous
        </button>
        <div className="page-info">
          Page 1 of 5
        </div>
        <button className="btn-page">
          Next →
        </button>
      </div>
    </div>
  )
}

export default AuditLogs
