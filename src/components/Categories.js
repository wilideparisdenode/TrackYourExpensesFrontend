"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await apiService.get("/category")
      setCategories(data)
      console.log(data)
    } catch (error) {
      setError("Failed to load categories")
      console.error("Error loading categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        // Update functionality would go here if implemented in backend
        setError("Update functionality not implemented in backend")
        return
      } else {
        await apiService.post("/category/create", formData)
        setSuccess("Category created successfully!")
      }

      setShowModal(false)
      setEditingCategory(null)
      setFormData({ name: "", description: "" })
      loadCategories()
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save category")
      console.error("Error saving category:", error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await apiService.delete(`/category/${id}`)
        setSuccess("Category deleted successfully!")
        loadCategories()
      } catch (error) {
        setError(error.response?.data?.error || "Failed to delete category")
        console.error("Error deleting category:", error)
      }
    }
  }

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name || "",
        description: category.description || ""
      })
    } else {
      setEditingCategory(null)
      setFormData({ name: "", description: "" })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({ name: "", description: "" })
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="categories">
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Create Category
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        {categories.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => openModal(category)}
                        disabled // Disabled because update not implemented in backend
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleDelete(category.id)}
                      >
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
            <p>No categories found. Create your first category to get started!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingCategory ? "Edit Category (Not Implemented)" : "Create Category"}
              </h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category Name*</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Food, Transportation"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={editingCategory} // Disabled for edit since not implemented
                >
                  {editingCategory ? "Update (Not Available)" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
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
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}

export default Categories