const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const token = localStorage.getItem("token")

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    }

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Auth
  async login(credentials) {
    return this.request("/login", {
      method: "POST",
      body: credentials,
    })
  }

  async signup(credentials) {
    return this.request("/user", {
      method: "POST",
      body: credentials,
    })
  }

  // Users
  async getUsers() {
    return this.request("/user")
  }

  // // Budgets
  // async getBudgets(id) {
  //   return this.request(`/budget/${id}`)
  // }

  async createBudget(budgetData) {
    return this.request("/budget/create_budget", {
      method: "POST",
      body: budgetData,
    })
  }

  async deleteBudget(id) {
    return this.request(`/budget/${id}`, {
      method: "DELETE",
    })
  }

  async trackBudget(userId, incomeId) {
    return this.request(`/budget/view/${userId}/${incomeId}`)
  }

  async viewBudgets(userId) {
    return this.request(`/budget/${userId}`)
  }

  // Expenses
  async addExpense(expenseData) {
    return this.request("/expense/add", {
      method: "POST",
      body: expenseData,
    })
  }

  async getExpensesByUserId(userId) {
    return this.request(`/expense/user/${userId}`)
  }

  async updateExpense(id, expenseData) {
    return this.request(`/expense/${id}`, {
      method: "PUT",
      body: expenseData,
    })
  }

  async deleteExpense(id) {
    return this.request(`/expense/${id}`, {
      method: "DELETE",
    })
  }

  // Income
  async addIncome(incomeData) {
    return this.request("/income/add", {
      method: "POST",
      body: incomeData,
    })
  }

  async getIncomeByUserId(userId) {
    return this.request(`/income/user/${userId}`)
  }

  async updateIncome(id, userId, incomeData) {
    return this.request(`/income/${id}?userId=${userId}`, {
      method: "PUT",
      body: incomeData,
    })
  }

  async deleteIncome(id, userId) {
    return this.request(`/income/${id}?userId=${userId}`, {
      method: "DELETE",
    })
  }

  // // Categories (if still needed)
  // async getCategories() {
  //   return this.request("/category")
  // }

  // Generic methods for flexibility
  async get(endpoint) {
    return this.request(endpoint)
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: data,
    })
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: data,
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    })
  }
}

export const apiService = new ApiService()