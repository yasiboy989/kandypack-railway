import { useState, useEffect } from 'react'
import './AuditLogs.css'
import { getAuditLogs, type AuditLog } from '../../lib/api'

function AuditLogs() {
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getAuditLogs()
      .then((logList) => {
        if (!mounted) return
        setLogs(logList)
      })
      .catch((err) => {
        console.error('Failed to load audit logs:', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    
    return () => {
      mounted = false
    }
  }, [])

  const actionTypes = [
    { value: 'all', label: 'All Actions', count: logs.length },
    { value: 'INSERT', label: 'Create', count: logs.filter(l => l.operation === 'INSERT').length },
    { value: 'UPDATE', label: 'Update', count: logs.filter(l => l.operation === 'UPDATE').length },
    { value: 'DELETE', label: 'Delete', count: logs.filter(l => l.operation === 'DELETE').length },
  ]

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.operation === filterType
    const matchesSearch = searchTerm === '' ||
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operation.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesType && matchesSearch
  })

  const getActionColor = (operation: string) => {
    switch (operation) {
      case 'INSERT': return 'badge-green'
      case 'DELETE': return 'badge-red'
      case 'UPDATE': return 'badge-yellow'
      default: return 'badge-blue'
    }
  }

  if (loading) {
    return (
      <div className="audit-logs">
        <div style={{ padding: '24px', textAlign: 'center' }}>Loading audit logs...</div>
      </div>
    )
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
              <div key={log.audit_id} className="table-row">
                <div className="td td-timestamp">
                  <div className="timestamp-value">{new Date(log.performed_at).toLocaleString()}</div>
                </div>
                <div className="td td-user">
                  <div className="user-info">
                    <div className="user-avatar-small">S</div>
                    <div>
                      <div className="user-name-small">System</div>
                      <div className="user-role-small">System</div>
                    </div>
                  </div>
                </div>
                <div className="td td-action">
                  <span className={`badge ${getActionColor(log.operation)}`}>
                    {log.operation}
                  </span>
                </div>
                <div className="td td-target">
                  <div className="target-text">{log.table_name}</div>
                </div>
                <div className="td td-ip">
                  <div className="ip-text">-</div>
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
