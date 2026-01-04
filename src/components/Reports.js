"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { useSelector } from "react-redux";
// ✅ Corrected imports
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CurrencyDollar, 
  PieChart, 
  Download, 
  Calendar, 
  Bullseye, 
  ExclamationTriangle 
} from "react-bootstrap-icons"

import "./Report.css"

const Reports = () => {
   const preferences=useSelector((state)=>state.preferences)

  const { user } = useAuth()
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [budget_id, setBudgetId] = useState("")
  const [budgets, setBudgets] = useState([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [timeRange, setTimeRange] = useState("monthly")

  // Load available budgets
  useEffect(() => {
    const loadBudgets = async () => {
      try {
        setLoading(true)
        const response = await apiService.viewBudgets(user._id)

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

    if (user?._id) {
      loadBudgets()
    }
  }, [user?._id])

  const generateReport = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")
      setReportData(null)

      if (!budget_id) throw new Error("Please select a budget")

      const response = await apiService.post("/report/createReport", {
        user_id: user._id,
        budget_id
      })

      if (response?.success === false) {
        throw new Error(response.error || "Failed to generate report")
      }

      const enhancedData = {
        ...response.data,
        insights: generateInsights(response.data),
        recommendations: generateRecommendations(response.data)
      }

      setReportData(enhancedData)
      setSuccess("Report generated successfully!")
    } catch (error) {
      setError(error.message || "Failed to generate report")
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = (data) => {
    const totalIncome = parseFloat(data.total_income || 0)
    const totalExpenses = parseFloat(data.total_expenses || 0)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0
    const expenseToIncomeRatio = totalIncome > 0 ? (totalExpenses / totalIncome * 100) : 0

    return {
      savingsRate: Math.max(0, savingsRate),
      expenseToIncomeRatio,
      isHealthy: savingsRate >= 20,
      spendingTrend: totalExpenses > totalIncome ? 'over' : 'under',
      riskLevel: savingsRate < 10 ? 'high' : savingsRate < 20 ? 'medium' : 'low'
    }
  }

  const generateRecommendations = (data) => {
    const insights = generateInsights(data)
    const recs = []

    if (insights.savingsRate < 10) {
      recs.push({
        type: 'warning',
        message: 'Your savings rate is very low. Consider reducing discretionary spending.',
        icon: ExclamationTriangle
      })
    }

    if (insights.spendingTrend === 'over') {
      recs.push({
        type: 'critical',
        message: 'You are spending more than you earn. Review your expenses immediately.',
        icon: ArrowDownRight
      })
    }

    if (insights.savingsRate >= 20) {
      recs.push({
        type: 'success',
        message: 'Excellent savings rate! Consider investing your surplus.',
        icon: ArrowUpRight
      })
    }

    if (parseFloat(data.total_expenses || 0) > parseFloat(data.total_income || 0) * 0.8) {
      recs.push({
        type: 'warning',
        message: 'Over 80% of income goes to expenses. Look for cost-saving opportunities.',
        icon: PieChart
      })
    }

    return recs
  }

  const exportReport = () => {
    if (!reportData) return

    const csvContent = [
      ["Financial Report", "", "", ""],
      ["Generated on", new Date().toLocaleDateString(), "", ""],
      ["", "", "", ""],
      ["SUMMARY", "", "", ""],
      ["Start Date", reportData.start_date, "", ""],
      ["End Date", reportData.end_date, "", ""],
      ["Total Income", `${reportData.total_income} CFA`, "", ""],
      ["Total Expenses", `${reportData.total_expenses} CFA`, "", ""],
      ["Net Balance", `${reportData.balance} CFA`, "", ""],
      ["", "", "", ""],
      ["INSIGHTS", "", "", ""],
      ["Savings Rate", `${reportData.insights.savingsRate.toFixed(1)}%`, "", ""],
      ["Expense Ratio", `${reportData.insights.expenseToIncomeRatio.toFixed(1)}%`, "", ""],
      ["Health", reportData.insights.isHealthy ? "Healthy" : "Needs Attention", "", ""],
      ["Risk Level", reportData.insights.riskLevel.toUpperCase(), "", ""],
      ["", "", "", ""],
      ["RECOMMENDATIONS", "", "", ""],
      ...reportData.recommendations.map(rec => [rec.type.toUpperCase(), rec.message, "", ""])
    ]
    .map(row => row.join(","))
    .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `financial-report-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getHealthColor = (risk) => {
    switch (risk) {
      case 'low': return '#10b981'
      case 'medium': return '#f59e0b'
      case 'high': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <div className="reports">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Financial Insights</h1>
          <p className="page-subtitle">Deep analysis of your financial health and spending patterns</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Config */}
      <div className="config-section">
        <div className="config-card">
          <div className="config-header">
            <h3><Bullseye size={20} /> Generate Report</h3>
            <p>Select a budget to analyze your financial performance</p>
          </div>
          
          <div className="config-controls">
            <div className="form-group">
              <label>Select Budget</label>
              <select value={budget_id} onChange={(e) => setBudgetId(e.target.value)}>
                <option value="">Choose a budget...</option>
                {budgets.map(budget => (
                  <option key={budget._id} value={budget._id}>
                    {budget.description} ({budget.amount}{preferences.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Analysis Period</label>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <button className="btn btn-generate" onClick={generateReport}>
              {loading ? "Analyzing..." : <><PieChart size={16}/> Generate Insights</>}
            </button>
          </div>
        </div>
      </div>

      {reportData && (
        <div className="insights-dashboard">
          {/* Overview */}
          <div className="overview-grid">
            <div className="overview-card income-card">
              <ArrowUpRight size={24}/>
              <h3>Total Income</h3>
              <div>{reportData.total_income}{preferences.symbol}</div>
            </div>
            <div className="overview-card expense-card">
              <ArrowDownRight size={24}/>
              <h3>Total Expenses</h3>
              <div>{reportData.total_expenses}{preferences.symbol}</div>
            </div>
            <div className="overview-card balance-card">
              <CurrencyDollar size={24}/>
              <h3>Net Balance</h3>
              <div>{reportData.balance}{preferences.symbol}</div>
            </div>
            <div className="overview-card savings-card">
              <PieChart size={24}/>
              <h3>Savings Rate</h3>
              <div>{reportData.insights.savingsRate.toFixed(1)}%</div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="recommendations-card">
            <h3>Recommendations</h3>
            {reportData.recommendations.map((rec, i) => {
              const Icon = rec.icon
              return <div key={i}><Icon size={16}/> {rec.message}</div>
            })}
          </div>

          {/* Export */}
          <div className="action-card">
            <button onClick={exportReport}><Download size={16}/> Export Report</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
