"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await apiService.getUsers()
      setUsers(data)
      console.log(data)
    } catch (error) {
      setError("Failed to load users")
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await apiService.updateUser(editingUser._id, formData)
        setSuccess("User updated successfully!")
      } else {
        await apiService.createUser(formData)
        setSuccess("User created successfully!")
      }

      setShowModal(false)
      setEditingUser(null)
      setFormData({ name: "", email: "", password: "", role: "user" })
      loadUsers()
    } catch (error) {
      setError("Failed to save user")
      console.error("Error saving user:", error)
    }
  }

  const handleDelete = async (user) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await apiService.deleteUser({ id: user._id })
        setSuccess("User deleted successfully!")
        loadUsers()
      } catch (error) {
        setError("Failed to delete user")
        console.error("Error deleting user:", error)
      }
    }
  }

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "user",
      })
    } else {
      setEditingUser(null)
      setFormData({ name: "", email: "", password: "", role: "user" })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({ name: "", email: "", password: "", role: "user" })
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <div className="users">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Add User
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        {users.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`user-role ${user.role}`}>{user.role}</span>
                  </td>
                  <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-edit btn-sm" onClick={() => openModal(user)}>
                        Edit
                      </button>
                      <button className="btn btn-delete btn-sm" onClick={() => handleDelete(user)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>No users found.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingUser ? "Edit User" : "Add User"}</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password {editingUser && "(leave blank to keep current)"}</label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  placeholder="Enter password"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? "Update User" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-role {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .user-role.admin {
          background-color: #dbeafe;
          color: #1d4ed8;
        }
        
        .user-role.user {
          background-color: #f3f4f6;
          color: #374151;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        
        .no-data {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .users {
          background: #0a192f;
          color: #f0f4f8;
          min-height: 100vh;
        }

        .users-table, .users-table th, .users-table td {
          background: #112d4e !important;
          color: #f0f4f8 !important;
          border-color: #3a7ca5 !important;
        }

        .summary-card, .page-header, .modal-content {
          background: #112d4e;
          color: #f0f4f8;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(10,25,47,0.2);
        }

        .btn-primary {
          background: #3a7ca5;
          color: #f0f4f8;
        }

        .btn-primary:hover {
          background: #1e3a5c;
        }

        input, select {
          background: #0a192f;
          color: #f0f4f8;
          border: 1px solid #3a7ca5;
          border-radius: 4px;
          padding: 0.5em;
        }

        input:focus, select:focus {
          outline: 2px solid #3a7ca5;
        }

        .form-group label {
          color: #f0f4f8;
        }
      `}</style>
    </div>
  )
}

export default Users
