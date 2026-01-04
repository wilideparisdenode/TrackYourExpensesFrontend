"use client"

import { useState, useEffect } from "react"
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
    const preferences=useSelector((state)=>state.preferences)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadIncome()
  }, [user])

  const loadIncome = async () => {
    try {
      setLoading(true)
      const data = await apiService.get(`/income/user/${user._id}`)
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
        user_id: user._id,
        date: new Date(formData.date).toISOString()
      }

      if (editingIncome) {
        const d = await apiService.editIncome(editingIncome, editingIncome._id);
        setSuccess("Income updated successfully!");
        console.log(d);
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

  // Chart data functions
  const getSourceChartData = () => {
    const sourceTotals = {};
    
    income.forEach(item => {
      const source = item.source || 'Unknown';
      sourceTotals[source] = (sourceTotals[source] || 0) + parseFloat(item.amount);
    });

    return Object.entries(sourceTotals).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0
    }));
  };

  const getMonthlyChartData = () => {
    const monthlyTotals = {};
    
    income.forEach(item => {
      const date = new Date(item.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + parseFloat(item.amount);
    });

    return Object.entries(monthlyTotals)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0
      }));
  };

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
          <span className="stat-value income-amount">{preferences.symbol}{totalIncome.toFixed(2)}</span>
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
            {getSourceChartData().map((item, index) => (
              <div key={index} className="chart-bar-item">
                <div className="bar-label">
                  <span>{item.name}</span>
                  <span>{preferences.symbol}{item.amount.toFixed(2)} ({item.percentage}%)</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Income by Month</h3>
          <div className="chart-bars">
            {getMonthlyChartData().map((item, index) => (
              <div key={index} className="chart-bar-item">
                <div className="bar-label">
                  <span>{item.name}</span>
                  <span>{preferences.symbol}{item.amount.toFixed(2)}</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Income Cards */}
      <div className="income-cards-container">
        {income.length > 0 ? (
          <div className="income-grid">
            {income.map((item) => (
              <div key={item.id} className="income-card">
                <div className="income-card-header">
                  <h3>{item.source}</h3>
                  <span className="income-amount">
                    {preferences.symbol}{parseFloat(item.amount).toFixed(2)}
                  </span>
                </div>
                
                <div className="income-card-details">
                  <div className="income-detail">
                    <span className="detail-label">Date:</span>
                    <span>{new Date(item.date).toLocaleDateString()}</span>
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
                  <button className="btn btn-delete btn-sm" onClick={() => handleDelete(item.id)}>
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

      <style jsx>{`
        .income {
          background: #0a192f;
          color: #f0f4f8;
          min-height: 100vh;
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .page-title {
          font-size: 24px;
          margin: 0;
          color: #f0f4f8;
        }

        .summary-card {
          background: #112d4e;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          display: flex;
          gap: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 14px;
          color: #a8b2c3;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #f0f4f8;
        }

        .income-amount {
          color: #28a745;
          font-weight: 600;
        }

        /* Charts Styles */
        .charts-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .chart-card {
          background: #112d4e;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .chart-card h3 {
          margin: 0 0 15px 0;
          color: #f0f4f8;
          font-size: 16px;
        }

        .chart-bars {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .chart-bar-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #f0f4f8;
        }

        .bar-track {
          width: 100%;
          height: 8px;
          background: #1e3a5c;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: #28a745;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        /* Income Cards Styles */
        .income-cards-container {
          margin-top: 20px;
        }

        .income-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .income-card {
          background: #112d4e;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #3a7ca5;
        }

        .income-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .income-card-header h3 {
          margin: 0;
          color: #f0f4f8;
          font-size: 16px;
          flex: 1;
          margin-right: 10px;
        }

        .income-card-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 15px;
        }

        .income-detail {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .detail-label {
          color: #a8b2c3;
          font-weight: 500;
        }

        .income-description {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .income-card-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        /* Buttons */
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s ease;
        }

        .btn-primary {
          background: #3a7ca5;
          color: #f0f4f8;
        }

        .btn-primary:hover {
          background: #1e3a5c;
        }

        .btn-secondary {
          background: #6c757d;
          color: #f0f4f8;
        }

        .btn-edit {
          background: #28a745;
          color: #fff;
        }

        .btn-edit:hover {
          background: #218838;
        }

        .btn-delete {
          background: #dc3545;
          color: #fff;
        }

        .btn-delete:hover {
          background: #b52a37;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: #112d4e;
          border-radius: 8px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          color: #f0f4f8;
        }

        .modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid #3a7ca5;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }

        form {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #f0f4f8;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #3a7ca5;
          border-radius: 4px;
          font-size: 14px;
          background: #0a192f;
          color: #f0f4f8;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        /* Alerts */
        .alert {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 16px;
          position: relative;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .close-btn {
          position: absolute;
          right: 8px;
          top: 8px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
        }

        /* Loading */
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #f0f4f8;
        }

        .spinner {
          border: 4px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          border-top: 4px solid #3a7ca5;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .no-income {
          text-align: center;
          padding: 40px 20px;
          color: #a8b2c3;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .charts-container {
            grid-template-columns: 1fr;
          }
          
          .income-grid {
            grid-template-columns: 1fr;
          }
          
          .income-card-header {
            flex-direction: column;
            gap: 10px;
          }
          
          .income-card-header h3 {
            margin-right: 0;
          }
          
          .summary-card {
            flex-direction: column;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default Income