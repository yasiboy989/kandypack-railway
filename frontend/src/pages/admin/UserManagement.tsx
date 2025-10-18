import { useState } from 'react'
import './UserManagement.css'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  lastLogin: string
}

function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'John Carter', email: 'john@example.com', role: 'Admin', status: 'active', lastLogin: '2024-01-30' },
    { id: '2', name: 'Sophie Moore', email: 'sophie@example.com', role: 'Manager', status: 'active', lastLogin: '2024-01-29' },
    { id: '3', name: 'Matt Cannon', email: 'matt@example.com', role: 'Driver', status: 'active', lastLogin: '2024-01-28' },
    { id: '4', name: 'Graham Hills', email: 'graham@example.com', role: 'Warehouse', status: 'inactive', lastLogin: '2024-01-20' },
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Driver',
    password: '',
  })

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    const user: User = {
      id: String(users.length + 1),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      lastLogin: new Date().toISOString().split('T')[0],
    }
    setUsers([...users, user])
    setShowAddModal(false)
    setNewUser({ name: '', email: '', role: 'Driver', password: '' })
  }

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id))
    }
  }

  const handleToggleStatus = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ))
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          + Add User
        </button>
      </div>

      <div className="filters-bar">
        <input type="text" placeholder="Search users..." className="search-input" />
        <select className="filter-select">
          <option>All Roles</option>
          <option>Admin</option>
          <option>Manager</option>
          <option>Warehouse</option>
          <option>Driver</option>
          <option>Assistant</option>
        </select>
        <select className="filter-select">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{user.name.charAt(0)}</div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td className="text-muted">{user.email}</td>
                <td>
                  <span className="role-badge">{user.role}</span>
                </td>
                <td>
                  <button
                    className={`status-badge ${user.status === 'active' ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleStatus(user.id)}
                  >
                    <span className="status-dot"></span>
                    {user.status}
                  </button>
                </td>
                <td className="text-muted">{user.lastLogin}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Edit">✏️</button>
                    <button className="btn-icon" title="Reset Password">🔑</button>
                    <button className="btn-icon btn-danger" title="Delete" onClick={() => handleDeleteUser(user.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddUser} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="input-field"
                >
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Warehouse</option>
                  <option>Driver</option>
                  <option>Assistant</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
