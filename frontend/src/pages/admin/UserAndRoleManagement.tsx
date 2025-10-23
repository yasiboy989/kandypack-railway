import { useState, useEffect } from 'react'
import './UserManagement.css'
import {
  getUsers,
  createUser,
  deleteUser,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  type User,
  type Role,
} from '../../lib/api'

type ActiveTab = 'users' | 'roles'

function UserAndRoleManagement() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('users')

  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Assistant',
    password: '',
  })

  // Roles state
  const [roles, setRoles] = useState<Role[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [showAddRoleModal, setShowAddRoleModal] = useState(false)
  const [newRole, setNewRole] = useState({
    name: '',
    rights: '',
  })

  // Load users
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
        if (mounted) setLoadingUsers(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // Load roles
  useEffect(() => {
    let mounted = true
    getRoles()
      .then((roleList) => {
        if (!mounted) return
        console.log('Loaded roles:', roleList)
        setRoles(roleList)
      })
      .catch((err) => {
        console.error('Failed to load roles:', err)
      })
      .finally(() => {
        if (mounted) setLoadingRoles(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // User handlers
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userData = {
        username: newUser.name.toLowerCase().replace(/\s+/g, ''),
        email: newUser.email,
        role: newUser.role,
        password: newUser.password,
        // Omit when unknown; API accepts undefined
        employee_id: undefined as number | undefined,
      }

      const createdUser = await createUser(userData)
      setUsers([...users, createdUser])
      setShowAddUserModal(false)
      setNewUser({ name: '', email: '', role: 'Assistant', password: '' })
      alert('User created successfully!')
    } catch (error) {
      console.error('Failed to create user:', error)
      alert('Failed to create user. Please try again.')
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id)
        setUsers(users.filter((u) => u.user_id !== id))
        alert('User deleted successfully!')
      } catch (error) {
        console.error('Failed to delete user:', error)
        alert('Failed to delete user. Please try again.')
      }
    }
  }

  // Role handlers
  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const roleData = {
        role_name: newRole.name,
        accessRights: newRole.rights,
      }

      const createdRole = await createRole(roleData)
      setRoles([...roles, createdRole])
      setShowAddRoleModal(false)
      setNewRole({ name: '', rights: '' })
      alert('Role created successfully!')
    } catch (error) {
      console.error('Failed to create role:', error)
      alert('Failed to create role. Please try again.')
    }
  }

  const handleDeleteRole = async (id: number) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(id)
        setRoles(roles.filter((r) => r.role_id !== id))
        alert('Role deleted successfully!')
      } catch (error) {
        console.error('Failed to delete role:', error)
        alert('Failed to delete role. Please try again.')
      }
    }
  }

  const handleEditRole = async (id: number) => {
    const role = roles.find((r) => r.role_id === id)
    if (!role) return

    const newRights = prompt('Update access rights:', role.accessRights || role.access_rights || '')
    if (newRights === null) return

    try {
      const updated = await updateRole(id, newRights)
      setRoles(roles.map((r) => (r.role_id === id ? updated : r)))
      alert('Role updated successfully!')
    } catch (error) {
      console.error('Failed to update role:', error)
      alert('Failed to update role. Please try again.')
    }
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <div>
          <h1 className="page-title">User & Role Management</h1>
          <p className="page-subtitle">Manage system users and their roles</p>
        </div>
      </div>

      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`tab-button ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          Roles
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="tab-content">
          <div className="page-header">
            <div></div>
            <button className="btn-primary" onClick={() => setShowAddUserModal(true)}>
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
              <option>Driver</option>
            </select>
            <select className="filter-select">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {loadingUsers ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>Loading users...</div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.user_id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">{user.user_name.charAt(0).toUpperCase()}</div>
                          <span>{user.user_name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{user.email}</td>
                      <td>
                        <span className="role-badge">{user.role}</span>
                      </td>
                      <td>
                        <button className="status-badge active">
                          <span className="status-dot"></span>
                          Active
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" title="Edit">
                            ✏️
                          </button>
                          <button className="btn-icon" title="Reset Password">
                            🔑
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            title="Delete"
                            onClick={() => handleDeleteUser(user.user_id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Add New User</h2>
                  <button
                    className="modal-close"
                    onClick={() => setShowAddUserModal(false)}
                  >
                    ×
                  </button>
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
                      required
                    >
                      <option value="">Select a role...</option>
                      {roles.length > 0 ? (
                        roles.map((role) => (
                          <option key={role.role_id} value={role.role_name}>
                            {role.role_name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No roles available</option>
                      )}
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
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowAddUserModal(false)}
                    >
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
      )}

      {/* ROLES TAB */}
      {activeTab === 'roles' && (
        <div className="tab-content">
          <div className="page-header">
            <div></div>
            <button className="btn-primary" onClick={() => setShowAddRoleModal(true)}>
              + Add Role
            </button>
          </div>

          {loadingRoles ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>Loading roles...</div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Role Name</th>
                    <th>Access Rights</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <tr key={role.role_id}>
                        <td>
                          <span className="role-badge">{role.role_name}</span>
                        </td>
                        <td className="text-muted">{role.accessRights || role.access_rights || 'Not specified'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              title="Edit"
                              onClick={() => handleEditRole(role.role_id)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon btn-danger"
                              title="Delete"
                              onClick={() => handleDeleteRole(role.role_id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-muted" style={{ textAlign: 'center', padding: '32px' }}>
                        No roles found. Create your first role to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Role Modal */}
          {showAddRoleModal && (
            <div className="modal-overlay" onClick={() => setShowAddRoleModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Add New Role</h2>
                  <button
                    className="modal-close"
                    onClick={() => setShowAddRoleModal(false)}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleAddRole} className="modal-form">
                  <div className="form-group">
                    <label>Role Name</label>
                    <input
                      type="text"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      className="input-field"
                      required
                      placeholder="e.g., Super Admin, Viewer"
                    />
                  </div>
                  <div className="form-group">
                    <label>Access Rights</label>
                    <textarea
                      value={newRole.rights}
                      onChange={(e) => setNewRole({ ...newRole, rights: e.target.value })}
                      className="input-field"
                      required
                      placeholder="Define access rights and permissions"
                      rows={4}
                      style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                  </div>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowAddRoleModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Add Role
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserAndRoleManagement
