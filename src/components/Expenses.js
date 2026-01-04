"use client"

import { useState, useEffect, useCallback } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import "./Expenses.css"
import { useSelector } from "react-redux";

const Expenses = () => {
  const { user } = useAuth();
  const preferences = useSelector((state) => state.preferences);

  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState({
    expenses: true,
    budgets: true,
    categories: true,
    submitting: false
  });
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    budget_id: "",
    category_id: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const response = await apiService.get('/category');
      // support multiple response shapes
      const data = Array.isArray(response) ? response : (response?.data ?? response);
      setCategories(data || []);
    } catch (err) {
      console.error("Category loading error:", err);
      setError(err?.message || "Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  }, [user]);

  const loadExpenses = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(prev => ({ ...prev, expenses: true }));
      const response = await apiService.getExpensesByUserId(user._id);
      const data = Array.isArray(response) ? response : (response?.data ?? response);
      setExpenses(data || []);
    } catch (err) {
      console.error("Expense loading error:", err);
      setError(err?.message || "Failed to load expenses");
      setExpenses([]);
    } finally {
      setLoading(prev => ({ ...prev, expenses: false }));
    }
  }, [user]);

  const loadBudgets = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(prev => ({ ...prev, budgets: true }));
      const response = await apiService.viewBudgets(user._id);
      const data = Array.isArray(response) ? response : (response?.data ?? response);
      setBudgets(data || []);
    } catch (err) {
      console.error("Budget loading error:", err);
      setError(err?.message || "Failed to load budgets");
      setBudgets([]);
    } finally {
      setLoading(prev => ({ ...prev, budgets: false }));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // load all initial data
    loadCategories();
    loadExpenses();
    loadBudgets();
  }, [user, loadCategories, loadExpenses, loadBudgets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) {
      setError("User not authenticated");
      return;
    }
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      setError("");
      setSuccess("");

      const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount) || 0,
        date: new Date(formData.date).toISOString(),
        category_id: formData.category_id,
        budget_id: formData.budget_id,
        userId: user._id // adjust if backend expects user_id
      };

      const response = editingExpense
        ? await apiService.put(`/expense/${editingExpense._id}`, expenseData)
        : await apiService.post("/expense/add", expenseData);

      const ok = response?.success ?? (response && !response.error);
      if (ok) {
        setSuccess(response?.message || (editingExpense ? "Expense updated successfully!" : "Expense added successfully!"));
        setShowModal(false);
        resetForm();
        await loadExpenses();
      } else {
        throw new Error(response?.error || "Failed to save expense");
      }
    } catch (err) {
      console.error("Error saving expense:", err);
      setError(err?.message || "Failed to save expense");
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      const response = await apiService.delete(`/expense/${id}`);
      const ok = response?.success ?? (response && !response.error);
      if (ok) {
        setSuccess(response?.message || "Expense deleted successfully!");
        await loadExpenses();
      } else {
        throw new Error(response?.error || "Failed to delete expense");
      }
    } catch (err) {
      console.error("Error deleting expense:", err);
      setError(err?.message || "Failed to delete expense");
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const openModal = (expense = null) => {
    setEditingExpense(expense);
    if (expense) {
      setFormData({
        description: expense.description || "",
        amount: expense.amount?.toString() || "",
        date: expense.date ? expense.date.split("T")[0] : new Date().toISOString().split("T")[0],
        budget_id: expense.budget_id || "",
        category_id: expense.category_id || ""
      });
    } else {
      setFormData({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        budget_id: "",
        category_id: ""
      });
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingExpense(null);
    setFormData({
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      budget_id: "",
      category_id: ""
    });
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const isLoading = loading.expenses || loading.budgets || loading.categories;
  const totalExpenses = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

  const getCategoryChartData = () => {
    const categoryTotals = {};
    expenses.forEach(exp => {
      const category = categories.find(c => c._id === exp.category_id);
      const name = category?.name || 'Uncategorized';
      categoryTotals[name] = (categoryTotals[name] || 0) + (parseFloat(exp.amount) || 0);
    });
    return Object.entries(categoryTotals).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : "0.0"
    }));
  };

  const getBudgetChartData = () => {
    const budgetTotals = {};
    expenses.forEach(exp => {
      const budget = budgets.find(b => b._id === exp.budget_id);
      const name = budget?.description || 'No Budget';
      budgetTotals[name] = (budgetTotals[name] || 0) + (parseFloat(exp.amount) || 0);
    });
    return Object.entries(budgetTotals).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : "0.0"
    }));
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="expenses">
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <button
          className="btn btn-primary"
          onClick={() => openModal()}
          disabled={loading.submitting}
        >
          + Add Expense
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
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value expense-amount">
            {preferences?.symbol || ""}{totalExpenses.toFixed(2)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Number of Expenses</span>
          <span className="stat-value">{expenses.length}</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        <div className="chart-card">
          <h3>Expenses by Category</h3>
          <div className="chart-bars">
            {getCategoryChartData().map((item, index) => (
              <div key={index} className="chart-bar-item">
                <div className="bar-label">
                  <span>{item.name}</span>
                  <span>{preferences?.symbol || ""}{Number(item.amount).toFixed(2)} ({item.percentage}%)</span>
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
          <h3>Expenses by Budget</h3>
          <div className="chart-bars">
            {getBudgetChartData().map((item, index) => (
              <div key={index} className="chart-bar-item">
                <div className="bar-label">
                  <span>{item.name}</span>
                  <span>{preferences?.symbol || ""}{Number(item.amount).toFixed(2)} ({item.percentage}%)</span>
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

      {/* Expenses Cards */}
      <div className="expenses-cards-container">
        {expenses.length > 0 ? (
          <div className="expenses-grid">
            {expenses.map((expense) => {
              const budget = budgets.find(b => b._id === expense.budget_id);
              const category = categories.find(c => c._id === expense.category_id);

              return (
                <div key={expense._id} className="expense-card">
                  <div className="expense-card-header">
                    <h3>{expense.description}</h3>
                    <span className="expense-amount">
                      {preferences?.symbol || ""}{(parseFloat(expense.amount) || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="expense-card-details">
                    <div className="expense-detail">
                      <span className="detail-label">Date:</span>
                      <span>{expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="expense-detail">
                      <span className="detail-label">Category:</span>
                      <span>{category?.name || 'Uncategorized'}</span>
                    </div>
                    <div className="expense-detail">
                      <span className="detail-label">Budget:</span>
                      <span>{budget?.description || 'No Budget'}</span>
                    </div>
                  </div>

                  <div className="expense-card-actions">
                    <button
                      className="btn btn-edit btn-sm"
                      onClick={() => openModal(expense)}
                      disabled={loading.submitting}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-delete btn-sm"
                      onClick={() => handleDelete(expense._id)}
                      disabled={loading.submitting}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-expenses">
            <p>No expenses found. Add your first expense to get started!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingExpense ? "Edit Expense" : "Add Expense"}</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category*</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description*</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
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

              <div className="form-group">
                <label>Budget</label>
                <select
                  value={formData.budget_id}
                  onChange={(e) => setFormData({ ...formData, budget_id: e.target.value })}
                >
                  <option value="">No Budget</option>
                  {budgets.map((budget) => (
                    <option key={budget._id} value={budget._id}>
                      {budget.description} ({preferences?.symbol || ""}{budget.amount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading.submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.submitting}
                >
                  {loading.submitting ? "Processing..." : (editingExpense ? "Update Expense" : "Add Expense")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;