"use client"
import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"

const Budgets = () => {
  
  const { user } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    end_date: "",
    income_id: ""
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [incomes, setIncomes] = useState([])
  const [trackingData, setTrackingData] = useState(null)

  useEffect(() => {
    loadBudgets()
    loadIncomes()
  }, [user])

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const data = await apiService.get(`/budget/${user._id}`)
      setBudgets(data.data)
      
    } catch (error) {
      setError("Failed to load budgets")
      console.error("Error loading budgets:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadIncomes = async () => {
    try {
      const data = await apiService.get(`/income/user/${user._id}`)
      setIncomes(data)
    } catch (error) {
      console.error("Error loading incomes:", error)
    }
  }

  // Budgets.js
const trackBudget = async (budget) => {
  try {
    const data = await apiService.get(`/budget/view/${user._id}/${budget.income_id}`);
    setTrackingData(data);
  } catch (error) {
    setError("Failed to track budget: " + (error.response?.data?.message || error.message));
    console.error("Error details:", error);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const budgetData = {
        ...formData,
        amount: Number.parseFloat(formData.amount),
        user_id: user._id,
        end_date: new Date(formData.end_date).toISOString()
      }

      if (editingBudget) {
        await apiService.put(`/budgets/${editingBudget.id}`, budgetData)
        setSuccess("Budget updated successfully!")
      } else {
        await apiService.post("/budget/create_budget", budgetData)
        setSuccess("Budget created successfully!")
      }

      setShowModal(false)
      setEditingBudget(null)
      setFormData({ description: "", amount: "", end_date: "", income_id: "" })
      loadBudgets()
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save budget")
      console.error("Error saving budget:", error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        await apiService.delete(`/budget/${id}`)
        setSuccess("Budget deleted successfully!")
        loadBudgets()
      } catch (error) {
        setError("Failed to delete budget")
        console.error("Error deleting budget:", error)
      }
    }
  }

  const openModal = (budget = null) => {
    if (budget) {
      setEditingBudget(budget)
      setFormData({
        description: budget.description || "",
        amount: budget.amount || "",
        end_date: budget.end_date?.split('T')[0] || "",
        income_id: budget.income_id || ""
      })
    } else {
      setEditingBudget(null)
      setFormData({ description: "", amount: "", end_date: "", income_id: "" })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBudget(null)
    setFormData({ description: "", amount: "", end_date: "", income_id: "" })
    setTrackingData(null)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading budgets...</p>
      </div>
    )
  }

  return (
    <div className="budgets">
      <div className="page-header">
        <h1 className="page-title">Budgets</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Create Budget
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        {budgets.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>End Date</th>
                <th>Income Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => (
                <tr key={budget.id}>
                  <td>{budget.description}</td>
                  <td>${budget.amount}</td>
                  <td>{new Date(budget.end_date).toLocaleDateString()}</td>
                  <td>
                    {incomes.find(i => i._id === budget.income_id)?.source || 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-info btn-sm" 
                        onClick={() => trackBudget(budget)}
                      >
                        Track
                      </button>
                      <button 
                        className="btn btn-edit btn-sm" 
                        onClick={() => openModal(budget)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-delete btn-sm" 
                        onClick={() => handleDelete(budget.id)}
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
            <p>No budgets found. Create your first budget to get started!</p>
          </div>
        )}
      </div>

      {/* Budget Tracking Modal */}
      {trackingData && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Budget Tracking</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="tracking-results">
              <div className="tracking-item">
                <span>Budget Amount:</span>
                <span>${trackingData.budget}</span>
              </div>
              <div className="tracking-item">
                <span>Total Spending:</span>
                <span>${trackingData.totalSpending}</span>
              </div>
              <div className="tracking-item">
                <span>Remaining Budget:</span>
                <span className={
                  trackingData.remainingBudget >= 0 ? "text-success" : "text-danger"
                }>
                  ${trackingData.remainingBudget}
                </span>
              </div>
              <div className="tracking-status">
                Status: <strong>{trackingData.status}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingBudget ? "Edit Budget" : "Create Budget"}</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Budget description"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Income Source</label>
                <select
                  className="form-control"
                  value={formData.income_id}
                  onChange={(e) => setFormData({ ...formData, income_id: e.target.value })}
                  required
                >
                  <option value="">Select Income Source</option>
                  {incomes.map(income => (
                    <option key={income._id} value={income._id}>
                      {income.source} (${income.amount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBudget ? "Update Budget" : "Create Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .budgets {
          background: #0a192f;
          color: #f0f4f8;
          min-height: 100vh;
        }

        .budgets-table, .budgets-table th, .budgets-table td {
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
        
        .capitalize {
          text-transform: capitalize;
        }
        
        .text-danger {
          color: #dc3545;
        }
        
        .text-success {
          color: #28a745;
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
        
        .tracking-results {
          padding: 20px;
        }
        
        .tracking-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        
        .tracking-status {
          margin-top: 20px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
          text-align: center;
          font-size: 1.1em;
        }
      `}</style>
    </div>
  )
}

export default Budgets