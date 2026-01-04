"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import "./categories.css"

import { Tags, Plus, Pencil, Trash2, Folder, BarChart, Hash } from "react-bootstrap-icons"
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
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await apiService.get("/category")
      setCategories(data)
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

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Generate color based on category name
  const getCategoryColor = (name) => {
    const colors = [
      '#3a7ca5', '#4ecdc4', '#ff6b6b', '#ffd166', '#06d6a0', 
      '#118ab2', '#ef476f', '#073b4c', '#7209b7', '#f72585'
    ]
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[index % colors.length]
  }

  // Get category icon based on name
  const getCategoryIcon = (name) => {
    const icons = {
      food: '🍔',
      transportation: '🚗',
      entertainment: '🎬',
      shopping: '🛍️',
      health: '🏥',
      education: '📚',
      bills: '📄',
      travel: '✈️',
      home: '🏠',
      other: '📦'
    }
    
    const key = name.toLowerCase()
    return icons[key] || '📁'
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
        <div className="header-content">
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize your expenses with custom categories</p>
        </div>
        <button className="btn btn-create" onClick={() => openModal()}>
          <Plus size={18} />
          <span>New Category</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <button onClick={() => setError("")} className="close-btn">×</button>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <button onClick={() => setSuccess("")} className="close-btn">×</button>
          {success}
        </div>
      )}

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total-categories">
            <Folder size={24} />
          </div>
          <div className="stat-content">
            <h3>{categories.length}</h3>
            <p>Total Categories</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active-categories">
            <Tags size={24} />
          </div>
          <div className="stat-content">
            <h3>{categories.filter(cat => cat.description).length}</h3>
            <p>With Descriptions</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <BarChart size={18} className="search-icon" />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="categories-section">
        <h2 className="section-title">Your Categories</h2>
        
        {filteredCategories.length > 0 ? (
          <div className="categories-grid">
            {filteredCategories.map((category) => (
              <div 
                key={category._id} 
                className="category-card"
                style={{ 
                  '--category-color': getCategoryColor(category.name),
                  '--category-light': getCategoryColor(category.name) + '20'
                }}
              >
                <div className="category-header">
                  <div className="category-icon">
                    <span className="emoji-icon">{getCategoryIcon(category.name)}</span>
                  </div>
                  <div className="category-actions">
                    <button 
                      className="btn-action edit" 
                      onClick={() => openModal(category)}
                      disabled
                      title="Edit (Not Available)"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      className="btn-action delete" 
                      onClick={() => handleDelete(category._id)}
                      title="Delete Category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="category-content">
                  <h3 className="category-name">{category.name}</h3>
                  {category.description && (
                    <p className="category-description">{category.description}</p>
                  )}
                  {!category.description && (
                    <p className="category-no-description">No description</p>
                  )}
                </div>

                <div className="category-footer">
                  <div className="category-meta">
                    <Hash size={12} />
                    <span>Expense Category</span>
                  </div>
                  <div 
                    className="category-color-indicator"
                    style={{ backgroundColor: getCategoryColor(category.name) }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-categories">
            <div className="no-categories-content">
              <Folder size={48} className="no-categories-icon" />
              <h3>No Categories Found</h3>
              <p>
                {searchTerm ? 
                  `No categories match "${searchTerm}"` : 
                  "Create your first category to organize expenses"
                }
              </p>
              {!searchTerm && (
                <button className="btn btn-create" onClick={() => openModal()}>
                  <Plus size={18} />
                  Create Category
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingCategory ? (
                  <>
                    <Pencil size={20} />
                    Edit Category
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Create New Category
                  </>
                )}
              </h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            {editingCategory && (
              <div className="modal-notice">
                <p>⚠️ Category editing is not available in the backend</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Groceries, Transportation, Entertainment"
                  disabled={editingCategory}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional: Add a description for this category"
                  rows="3"
                  disabled={editingCategory}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-save"
                  disabled={editingCategory}
                >
                  {editingCategory ? "Update Not Available" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     
    </div>
  )
}

export default Categories