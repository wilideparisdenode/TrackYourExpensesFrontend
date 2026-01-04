import { useState, useEffect, useCallback } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { useSelector } from "react-redux";

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
  const preferences = useSelector((state) => state.preferences)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadIncome = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(true)
      const res = await apiService.get(`/income/user/${user._id}`)
      setIncome(res?.data || [])
    } catch (err) {
      setError("Failed to load income data")
      console.error("Error loading income:", err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return;
    loadIncome()
  }, [user, loadIncome])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!user?._id) {
      setError("User not authenticated")
      return;
    }
    try {
      const incomeData = {
        ...formData,
        amount: Number.parseFloat(formData.amount) || 0,
        user_id: user._id,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString()
      }

      if (editingIncome) {
        await apiService.put(`/income/${editingIncome._id}`, incomeData)
        setSuccess("Income updated successfully!");
      } else {
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
      await loadIncome()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save income")
      console.error("Error saving income:", err)
    }
  }, [formData, editingIncome, user, loadIncome])

  const handleDelete = useCallback(async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this income entry?")) return;
    try {
      await apiService.delete(`/income/${id}`)
      setSuccess("Income deleted successfully!")
      await loadIncome()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete income")
      console.error("Error deleting income:", err)
    }
  }, [loadIncome])

  const openModal = useCallback((incomeItem = null) => {
    if (incomeItem) {
      setEditingIncome(incomeItem)
      setFormData({
        source: incomeItem.source || "",
        amount: incomeItem.amount ?? "",
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
  }, [])

  const closeModal = useCallback(() => {
    setShowModal(false)
    setEditingIncome(null)
    setFormData({
      source: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
  }, [])

  const totalIncome = income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading income...</p>
      </div>
    )
  }

  return (
    <div className="income">
      <div className="page-header">
        <h1 className="page-title">Income</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Add Income
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

      <div className="summary-card">
        <div className="stat-item">
          <span className="stat-label">Total Income</span>
          <span className="stat-value income-amount">{preferences?.symbol || ""}{totalIncome.toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Number of Entries</span>
          <span className="stat-value">{income.length}</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        <div className="chart-card">
          <h3>Income by Source</h3>
          <div className="chart-bars">
            {(() => {
              const sourceTotals = {};
              income.forEach(item => {
                const source = item.source || 'Unknown';
                sourceTotals[source] = (sourceTotals[source] || 0) + (parseFloat(item.amount) || 0);
              });
              return Object.entries(sourceTotals).map(([name, amount], index) => {
                const percentage = totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0;
                return (
                  <div key={index} className="chart-bar-item">
                    <div className="bar-label">
                      <span>{name}</span>
                      <span>{preferences?.symbol || ""}{amount.toFixed(2)} ({percentage}%)</span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>

        <div className="chart-card">
          <h3>Income by Month</h3>
          <div className="chart-bars">
            {(() => {
              const monthlyTotals = {};
              income.forEach(item => {
                const date = item.date ? new Date(item.date) : new Date();
                const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + (parseFloat(item.amount) || 0);
              });
              return Object.entries(monthlyTotals)
                .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                .map(([name, amount], index) => {
                  const percentage = totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0;
                  return (
                    <div key={index} className="chart-bar-item">
                      <div className="bar-label">
                        <span>{name}</span>
                        <span>{preferences?.symbol || ""}{amount.toFixed(2)}</span>
                      </div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })
            })()}
          </div>
        </div>
      </div>

      {/* Income Cards */}
      <div className="income-cards-container">
        {income.length > 0 ? (
          <div className="income-grid">
            {income.map((item) => (
              <div key={item._id || item.id} className="income-card">
                <div className="income-card-header">
                  <h3>{item.source}</h3>
                  <span className="income-amount">
                    {preferences?.symbol || ""}{(parseFloat(item.amount) || 0).toFixed(2)}
                  </span>
                </div>
                
                <div className="income-card-details">
                  <div className="income-detail">
                    <span className="detail-label">Date:</span>
                    <span>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {item.description && (
                    <div className="income-detail">
                      <span className="detail-label">Description:</span>
                      <span className="income-description">{item.description}</span>
                    </div>
                  )}
                </div>

                <div className="income-card-actions">
                  <button className="btn btn-edit btn-sm" onClick={() => openModal(item)}>
                    Edit
                  </button>
                  <button className="btn btn-delete btn-sm" onClick={() => handleDelete(item._id || item.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-income">
            <p>No income entries found. Add your first income entry to get started!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingIncome ? "Edit Income" : "Add Income"}</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Source*</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  required
                  placeholder="e.g., Salary, Freelance, Investment"
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
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Date*</label>
                <input
                  type="date"
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
    </div>
  )
}

export default Income