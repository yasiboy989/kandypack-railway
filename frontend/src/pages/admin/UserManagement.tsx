import { useState, useEffect } from 'react'
import './UserManagement.css'
import { getUsers, createUser, updateUser, deleteUser, type User } from '../../lib/api'

function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Assistant',
    password: '',
  })

  useEffect(() => {
    let mounted = true
    getUsers()
      .then((userList) => {
        if (!mounted) return
        setUsers(userList)
      })
      .catch((err) => {
        console.error('Failed to load users:', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    
    return () => {
      mounted = false
    }
  }, [])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userData = {
        username: newUser.name.toLowerCase().replace(/\s+/g, ''),
        email: newUser.email,
        role: newUser.role,
        password: newUser.password,
        employee_id: null
      }
      
      const createdUser = await createUser(userData)
      setUsers([...users, createdUser])
      setShowAddModal(false)
      setNewUser({ name: '', email: '', role: 'Assistant', password: '' })
    } catch (error) {
      console.error('Failed to create user:', error)
      alert('Failed to create user. Please try again.')
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id)
        setUsers(users.filter(u => u.user_id !== id))
      } catch (error) {
        console.error('Failed to delete user:', error)
        alert('Failed to delete user. Please try again.')
      }
    }
  }

  const handleToggleStatus = async (id: number) => {
    // This would require a backend endpoint to toggle user status
    // For now, we'll just show an alert
    alert('User status toggle not implemented yet')
  }

  if (loading) {
    return (
      <div className="user-management">
        <div style={{ padding: '24px', textAlign: 'center' }}>Loading users...</div>
      </div>
    )
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
              <tr key={user.user_id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{user.user_name.charAt(0)}</div>
                    <span>{user.user_name}</span>
                  </div>
                </td>
                <td className="text-muted">{user.email}</td>
                <td>
                  <span className="role-badge">{user.role}</span>
                </td>
                <td>
                  <button
                    className="status-badge active"
                    onClick={() => handleToggleStatus(user.user_id)}
                  >
                    <span className="status-dot"></span>
                    Active
                  </button>
                </td>
                <td className="text-muted">Recently</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Edit">✏️</button>
                    <button className="btn-icon" title="Reset Password">🔑</button>
                    <button className="btn-icon btn-danger" title="Delete" onClick={() => handleDeleteUser(user.user_id)}>🗑️</button>
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
