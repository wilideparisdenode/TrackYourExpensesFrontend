"use client"
import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { Wallet, CalendarEvent, Trash, PencilSquare, PieChart, ArrowUpRight, ArrowDownRight } from "react-bootstrap-icons";
import { useSelector } from "react-redux";
   
import "./budget.css"
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
  const preferences=useSelector((state)=>state.preferences);
  const color=useSelector((state)=>state.mode.theme);
 
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [incomes, setIncomes] = useState([])
  const [trackingData, setTrackingData] = useState(null)

  useEffect(() => {
    loadBudgets()
    loadIncomes()
  }, [])

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

  const trackBudget = async (budget) => {
    try {
      const data = await apiService.get(`/budget/view/${user._id}/${budget.income_id}`)
      setTrackingData(data)
    } catch (error) {
      setError("Failed to track budget: " + (error.response?.data?.message || error.message))
      console.error("Error details:", error)
    }
  }

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
        await apiService.put(`/budgets/${editingBudget._id}`, budgetData)
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

  // Calculate budget statistics
  const getBudgetStats = () => {
    const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
    const activeBudgets = budgets.filter(budget => new Date(budget.end_date) > new Date()).length;
    const endingSoon = budgets.filter(budget => {
      const daysLeft = Math.ceil((new Date(budget.end_date) - new Date()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7 && daysLeft > 0;
    }).length;

    return { totalBudget, activeBudgets, endingSoon };
  };

  const stats = getBudgetStats();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading budgets...</p>
      </div>
    )
  }

  return (
    <div className={`budgets ${color}` }>
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Budget Management</h1>
          <p className="page-subtitle">Track and manage your financial plans</p>
        </div>
        <button className="btn btn-create" onClick={() => openModal()}>
          <span>+ Create Budget</span>
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
          <div className="stat-icon total-budget">
            <Wallet size={24} />
          </div>
          <div className="stat-content">
            <h3>{preferences.symbol}{stats.totalBudget.toFixed(2)}</h3>
            <p>Total Budget</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active-budgets">
            <PieChart size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.activeBudgets}</h3>
            <p>Active Budgets</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon ending-soon">
            <CalendarEvent size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.endingSoon}</h3>
            <p>Ending Soon</p>
          </div>
        </div>
      </div>

      {/* Budget Cards with Progress Bars */}
      <div className="budgets-section">
        <h2 className="section-title">Your Budgets</h2>
        <div className="budgets-grid">
          {budgets.length > 0 ? (
            budgets.map((budget) => {
              const incomeSource = incomes.find(i => i._id === budget.income_id)?.source || 'Not linked';
              const daysLeft = Math.ceil((new Date(budget.end_date) - new Date()) / (1000 * 60 * 60 * 24));
              const isExpired = daysLeft < 0;
              
              return (
                <div key={budget._id} className="budget-card">
                  <div className="budget-card-header">
                    <div className="budget-title">
                      <h3>{budget.description}</h3>
                      <span className={`status-badge ${isExpired ? 'expired' : daysLeft <= 7 ? 'ending' : 'active'}`}>
                        {isExpired ? 'Expired' : daysLeft <= 7 ? 'Ending' : 'Active'}
                      </span>
                    </div>
                    <div className="budget-amount">{preferences.symbol}{parseFloat(budget.amount).toFixed(2)}</div>
                  </div>

                  <div className="budget-details">
                    <div className="detail-item">
                      <CalendarEvent size={14} />
                      <span>Ends: {new Date(budget.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <Wallet size={14} />
                      <span>Source: {incomeSource}</span>
                    </div>
                    <div className="detail-item">
                      {isExpired ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                      <span>{isExpired ? 'Expired' : `${daysLeft} days left`}</span>
                    </div>
                  </div>

                  <div className="budget-actions">
                    <button 
                      className="btn-action track" 
                      onClick={() => trackBudget(budget)}
                      title="Track Budget"
                    >
                      <PieChart size={16} />
                    </button>
                    <button 
                      className="btn-action edit" 
                      onClick={() => openModal(budget)}
                      title="Edit Budget"
                    >
                      <PencilSquare size={16} />
                    </button>
                    <button 
                      className="btn-action delete" 
                      onClick={() => handleDelete(budget._id)}
                      title="Delete Budget"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-budgets">
              <div className="no-budgets-content">
                <Wallet size={48} />
                <h3>No Budgets Yet</h3>
                <p>Create your first budget to start tracking your finances</p>
                <button className="btn btn-create" onClick={() => openModal()}>
                  Create Budget
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tracking Modal */}
      {trackingData && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Budget Tracking</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="tracking-results">
              <div className="tracking-item">
                <span>Budget Amount:</span>
                <span className="amount">{preferences.symbol}{trackingData.budget}</span>
              </div>
              <div className="tracking-item">
                <span>Total Spending:</span>
                <span className="amount spent">{preferences.symbol}{trackingData.totalSpending}</span>
              </div>
              <div className="tracking-item">
                <span>Remaining Budget:</span>
                <span className={`amount ${trackingData.remainingBudget >= 0 ? "remaining" : "over-budget"}`}>
                 {preferences.symbol}{trackingData.remainingBudget}
                </span>
              </div>
              <div className={`status-display ${trackingData.status.toLowerCase()}`}>
                Status: <strong>{trackingData.status}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBudget ? "Edit Budget" : "Create New Budget"}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Budget Description*</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="e.g., Monthly Groceries, Entertainment"
                />
              </div>

              <div className="form-group">
                <label>Amount*</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>End Date*</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Income Source</label>
                <select
                  value={formData.income_id}
                  onChange={(e) => setFormData({ ...formData, income_id: e.target.value })}
                >
                  <option value="">Select Income Source</option>
                  {incomes.map((income) => (
                    <option key={income._id} value={income._id}>
                      {income.source} ({preferences.symbol}{income.amount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-save">
                  {editingBudget ? "Update Budget" : "Create Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
    </div>
  )
}

export default Budgets