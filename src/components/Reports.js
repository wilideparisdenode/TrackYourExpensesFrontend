"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import "./Report.css"

const Reports = () => {
  const { user } = useAuth()
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [budget_id, setBudgetId] = useState("")
  const [budgets, setBudgets] = useState([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Load available budgets for the user
  useEffect(() => {
    const loadBudgets = async () => {
      try {
        setLoading(true)
        const response = await apiService.viewBudgets(user.id)
        
        if (Array.isArray(response)) {
          setBudgets(response)
        } else if (response?.data) {
          setBudgets(response.data)
        } else {
          throw new Error("Invalid budgets data format")
        }
      } catch (error) {
        setError(error.message)
        console.error("Error loading budgets:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user?.id) {
      loadBudgets()
    }
  }, [user?.id])

  const generateReport = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")
      setReportData(null)
      
      if (!budget_id) {
        throw new Error("Please select a budget")
      }

      const response = await apiService.post("/report/createReport", {
        user_id: user.id,
        budget_id
      })

      if (response?.success === false) {
        throw new Error(response.error || "Failed to generate report")
      }

      setReportData(response)
      setSuccess("Report generated successfully!")
    } catch (error) {
      setError(error.message || "Failed to generate report")
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!reportData) return

    const csvContent = [
      ["Budget Report", ""],
      ["Start Date", reportData.start_date],
      ["End Date", reportData.end_date],
      ["Total Income", reportData.total_income],
      ["Total Expenses", reportData.total_expenses],
      ["Balance", reportData.balance]
    ]
    .map(row => row.join(","))
    .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `budget-report-${budget_id}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="reports">
      <div className="page-header">
        <h1 className="page-title">Budget Reports</h1>
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

      <div className="card">
        <div className="card-header">Generate Budget Report</div>
        <div className="report-config">
          <div className="form-group">
            <label className="form-label">Select Budget</label>
            <select 
              className="form-control" 
              value={budget_id} 
              onChange={(e) => setBudgetId(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Select a Budget</option>
              {budgets.map(budget => (
                <option key={budget.id} value={budget.id}>
                  {budget.description} (${parseFloat(budget.amount).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={generateReport} 
            disabled={loading || !budget_id}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {reportData && (
        <div className="report-results">
          <div className="card">
            <div className="card-header">
              <span>Budget Report Summary</span>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={exportReport}
                disabled={loading}
              >
                Export CSV
              </button>
            </div>

            <div className="report-summary">
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Start Date</span>
                  <span className="summary-value">
                    {new Date(reportData.start_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">End Date</span>
                  <span className="summary-value">
                    {new Date(reportData.end_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Total Income</span>
                  <span className="summary-value income-amount">
                    ${parseFloat(reportData.total_income || 0).toFixed(2)}
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Total Expenses</span>
                  <span className="summary-value expense-amount">
                    ${parseFloat(reportData.total_expenses || 0).toFixed(2)}
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Balance</span>
                  <span
                    className={`summary-value ${
                      parseFloat(reportData.balance || 0) >= 0 
                        ? "income-amount" 
                        : "expense-amount"
                    }`}
                  >
                    ${parseFloat(reportData.balance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports