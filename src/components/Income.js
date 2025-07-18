"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"

const Income = () => {
  const { user } = useAuth()
  const [income, setIncome] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)
  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadIncome()
  }, [user])

  const loadIncome = async () => {
    try {
      setLoading(true)
      const data = await apiService.get(`/income/user/${user.id}`)
      setIncome(data)
    } catch (error) {
      setError("Failed to load income data")
      console.error("Error loading income:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const incomeData = {
        ...formData,
        amount: Number.parseFloat(formData.amount),
        user_id: user.id,
        date: new Date(formData.date).toISOString()
      }

      if (editingIncome) {
        await apiService.put(`/income/${editingIncome.id}`, incomeData)
        setSuccess("Income updated successfully!")
      } else {
        // the add functionality is working
        await apiService.post("/income/add", incomeData)
        setSuccess("Income added successfully!")
      }

      setShowModal(false)
      setEditingIncome(null)
      setFormData({
        source: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      })
      loadIncome()
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save income")
      console.error("Error saving income:", error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income entry?")) {
      try {
        await apiService.delete(`/income/${id}`)
        setSuccess("Income deleted successfully!")
        loadIncome()
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete income")
        console.error("Error deleting income:", error)
      }
    }
  }

  const openModal = (incomeItem = null) => {
    if (incomeItem) {
      setEditingIncome(incomeItem)
      setFormData({
        source: incomeItem.source || "",
        amount: incomeItem.amount || "",
        description: incomeItem.description || "",
        date: incomeItem.date ? incomeItem.date.split('T')[0] : new Date().toISOString().split("T")[0],
      })
    } else {
      setEditingIncome(null)
      setFormData({
        source: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingIncome(null)
    setFormData({
      source: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading income...</p>
      </div>
    )
  }

  const totalIncome = income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

  return (
    <div className="income">
      <div className="page-header">
        <h1 className="page-title">Income</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Add Income
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Income</span>
            <span className="stat-value income-amount">${totalIncome}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Number of Entries</span>
            <span className="stat-value">{income.length}</span>
          </div>
        </div>
      </div>

      <div className="card">
        {income.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {income.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.source}</td>
                  <td>{item.description || '-'}</td>
                  <td className="income-amount">${item.amount}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={() => openModal(item)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
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
            <p>No income entries found. Add your first income entry to get started!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingIncome ? "Edit Income" : "Add Income"}</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Source*</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  required
                  placeholder="e.g., Salary, Freelance, Investment"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount*</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="0.00"
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

              <div className="form-group">
                <label className="form-label">Date*</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingIncome ? "Update Income" : "Add Income"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .summary-stats {
          display: flex;
          gap: 40px;
          align-items: center;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
        }
        
        .income-amount {
          color: #28a745;
          font-weight: 600;
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
        
        @media (max-width: 768px) {
          .summary-stats {
            flex-direction: column;
            gap: 20px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}

export default Income