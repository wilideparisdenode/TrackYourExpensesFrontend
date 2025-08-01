"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import "./Expenses.css"
const Expenses = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    if (user?._id) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      
        await loadCategories();
        await loadExpenses();
        await loadBudgets();
      
    } catch (error) {
      console.error("Detailed loading error:", {
        message: error.message,
        stack: error.stack,
        response: error.response // if using axios or similar
      });
      setError("Failed to load initial data. See console for details.");
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const response = await apiService.get('/category');
      if (response) {
        console.log(response)
        setCategories(response);
        
      } else {
        throw new Error(response.error || "Failed to load categories");
      }
    } catch (error) {
      console.error("Category loading error:", error);
      console.log(error)

      setError(error.message);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(prev => ({ ...prev, expenses: true }));
      const response = await apiService.getExpensesByUserId(user._id);
      console.log("Expenses API Response:", response); // 👈 Debug log
      
      // If response is an array, use it directly
      if (Array.isArray(response)) {
        setExpenses(response);
      } 
      // If response is { data: [...] }, use response.data
      else if (response?.data) {
        setExpenses(response.data);
      }
      // If response is { success, data }, keep existing logic
      else if (response?.success) {
        setExpenses(response.data || []);
      }
      // Fallback for unexpected responses
      else {
        throw new Error("Invalid expenses data format");
      }
    } catch (error) {
      console.error("Expense loading error:", error);
      setError(error.message);
      setExpenses([]); // Ensure expenses is never undefined
    } finally {
      setLoading(prev => ({ ...prev, expenses: false }));
    }
  };

  const loadBudgets = async () => {
    try {
      setLoading(prev => ({ ...prev, budgets: true }));
      const response = await apiService.viewBudgets(user._id);
      console.log("Budgets API Response:", response); // 👈 Debug log
      
      if (Array.isArray(response)) {
        setBudgets(response);
      } 
      else if (response?.data) {
        setBudgets(response.data);
      }
      else if (response?.success) {
        setBudgets(response.data || []);
      }
      else {
        throw new Error("Invalid budgets data format");
      }
    } catch (error) {
      console.error("Budget loading error:", error);
      setError(error.message);
      setBudgets([]); // Ensure budgets is never undefined
    } finally {
      setLoading(prev => ({ ...prev, budgets: false }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      setError("");
      setSuccess("");
      
      const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        category_id: formData.category_id,
        budget_id: formData.budget_id, // From ,my select input
        userId: user._id // Check if backend expects 'user_id' or 'userId'
      };
      console.log(expenseData)
      const response = editingExpense 
        ? await apiService.put(`/expense/${editingExpense._id}`, expenseData)
        : await apiService.post("/expense/add", expenseData);

      if (response.success) {
        setSuccess(response.message || 
          (editingExpense ? "Expense updated successfully!" : "Expense added successfully!"));
        setShowModal(false);
        await loadExpenses();
        resetForm();
      } else {
        throw new Error(response.error || "Failed to save expense");
      }
    } catch (error) {
      setError(error.message);
      console.error("Error saving expense:", error);
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        setLoading(prev => ({ ...prev, submitting: true }));
        const response = await apiService.delete(`/expense/${id}`);
        if (response.success) {
          setSuccess(response.message || "Expense deleted successfully!");
          await loadExpenses();
        } else {
          throw new Error(response.error || "Failed to delete expense");
        }
      } catch (error) {
        setError(error.message);
        console.error("Error deleting expense:", error);
      } finally {
        setLoading(prev => ({ ...prev, submitting: false }));
      }
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
            ${totalExpenses.toFixed(2)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Number of Expenses</span>
          <span className="stat-value">{expenses.length}</span>
        </div>
      </div>

      <div className="expenses-table-container">
        {expenses.length > 0 ? (
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => {
                const budget = budgets.find(b => b._id === expense.budget_id);
                const category = categories.find(c => c._id === expense.category_id);
                return (
                  <tr key={expense._id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.description}</td>
                    <td>{category?.name || 'Uncategorized'}</td>
                    <td>{budget?.description || 'No Budget'}</td>
                    <td className="expense-amount">
                      ${parseFloat(expense.amount).toFixed(2)}
                    </td>
                    <td>
                      <div className="action-buttons">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                      {budget.description} (${budget.amount})
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
                  {loading.submitting ? "Processing..." : 
                   (editingExpense ? "Update Expense" : "Add Expense")}
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