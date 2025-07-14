"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { apiService } from "../services/api"
import { 
  CashCoin, 
  CurrencyExchange, 
  GraphUpArrow, 
  GraphDownArrow,
  ClockHistory,
  Wallet2,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight
} from "react-bootstrap-icons"
import "./Dashboard.css"

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    budgets: [],
    recentExpenses: [],
    recentIncome: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [budgets, expenses, income] = await Promise.all([
        apiService.getBudgets(),
        apiService.getExpensesByUserId(user.id),
        apiService.getIncomeByUserId(user.id),
      ])

      const totalIncome = income.reduce((sum, item) => sum + (item.amount || 0), 0)
      const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0)

      setDashboardData({
        totalIncome,
        totalExpenses,
        budgets: budgets.slice(0, 5),
        recentExpenses: expenses.slice(0, 5),
        recentIncome: income.slice(0, 5),
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your financial overview...</p>
      </div>
    )
  }

  const balance = dashboardData.totalIncome - dashboardData.totalExpenses
  const balancePercentage = dashboardData.totalIncome > 0 
    ? Math.abs((balance / dashboardData.totalIncome) * 100).toFixed(1)
    : 0

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Financial Overview</h1>
        <p className="page-subtitle">Welcome back, {user?.name || "User"}. Here's your financial summary.</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="financial-summary-grid">
        <div className="summary-card income-card">
          <div className="card-icon">
            <CashCoin size={24} />
          </div>
          <div className="card-content">
            <h3 className="card-title">Total Income</h3>
            <p className="card-amount">${dashboardData.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="card-trend positive">
              <ArrowUpRight size={14} /> 
              <span>All time</span>
            </p>
          </div>
        </div>

        <div className="summary-card expense-card">
          <div className="card-icon">
            <CurrencyExchange size={24} />
          </div>
          <div className="card-content">
            <h3 className="card-title">Total Expenses</h3>
            <p className="card-amount">${dashboardData.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="card-trend negative">
              <ArrowDownRight size={14} /> 
              <span>All time</span>
            </p>
          </div>
        </div>

        <div className={`summary-card balance-card ${balance >= 0 ? "positive" : "negative"}`}>
          <div className="card-icon">
            {balance >= 0 ? <GraphUpArrow size={24} /> : <GraphDownArrow size={24} />}
          </div>
          <div className="card-content">
            <h3 className="card-title">Current Balance</h3>
            <p className="card-amount">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="card-trend">
              {balance >= 0 ? (
                <><ArrowUpRight size={14} /> <span>{balancePercentage}% of income</span></>
              ) : (
                <><ArrowDownRight size={14} /> <span>{balancePercentage}% of income</span></>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="dashboard-grid">
        <div className="activity-card">
          <div className="card-header">
            <div className="header-title">
              <ClockHistory size={18} />
              <h3>Recent Transactions</h3>
            </div>
            <button className="view-all-btn">View All</button>
          </div>
          
          <div className="transaction-list">
            {dashboardData.recentIncome.concat(dashboardData.recentExpenses)
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 5)
              .map((item, index) => (
                <div key={index} className="transaction-item">
                  <div className="transaction-icon">
                    {item.amount ? (
                      <div className={`icon-container ${item.amount >= 0 ? 'income' : 'expense'}`}>
                        {item.amount >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      </div>
                    ) : null}
                  </div>
                  <div className="transaction-details">
                    <span className="transaction-title">{item.description || item.source || "Transaction"}</span>
                    <span className="transaction-date">
                      {new Date(item.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className={`transaction-amount ${item.amount >= 0 ? 'income' : 'expense'}`}>
                    {item.amount >= 0 ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
                  </div>
                </div>
              ))
            }
            {dashboardData.recentIncome.length === 0 && dashboardData.recentExpenses.length === 0 && (
              <div className="empty-state">
                <PlusCircle size={32} />
                <p>No recent transactions</p>
                <button className="btn btn-primary">Add Transaction</button>
              </div>
            )}
          </div>
        </div>

        {/* Budget Overview */}
        <div className="budget-card">
          <div className="card-header">
            <div className="header-title">
              <Wallet2 size={18} />
              <h3>Budget Overview</h3>
            </div>
            <button className="view-all-btn">View All</button>
          </div>
          
          <div className="budget-list">
            {dashboardData.budgets.length > 0 ? (
              dashboardData.budgets.map((budget, index) => {
                const percentage = Math.min((budget.spent / budget.amount) * 100, 100)
                const status = percentage > 90 ? 'over' : percentage > 70 ? 'warning' : 'good'
                
                return (
                  <div key={index} className="budget-item">
                    <div className="budget-info">
                      <span className="budget-name">{budget.name || "Unnamed Budget"}</span>
                      <div className="budget-meta">
                        <span className="budget-spent">${budget.spent.toFixed(2)}</span>
                        <span className="budget-total">of ${budget.amount.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className={`budget-progress ${status}`}>
                      <div 
                        className="budget-progress-bar" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                      <span className="budget-percentage">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="empty-state">
                <Wallet2 size={32} />
                <p>No budgets created yet</p>
                <button className="btn btn-primary">Create Budget</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard