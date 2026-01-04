const API_BASE_URL = process.env.REACT_APP_API_URL|| "https://trackyourexpensesbackend.onrender.com"

class ApiService {
  // ✅ Generic request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
     console.log("ENV:", process.env);
console.log("API URL:", process.env.REACT_APP_API_URL);

    // Retrieve token from localStorage (optional)
    const token = localStorage.getItem("token") || null

    // Build request configuration
    const config = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {}),
      },
      ...options,
    }

    // Convert JS object to JSON string if needed
    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      console.log("Response:", response)

      // Handle non-OK responses
      if (!response.ok) {
        let errorData = {}
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: "Unknown error occurred" }
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // Try to parse JSON response safely
      try {
        return await response.json()
      } catch {
        return null // In case the response is empty (204 No Content)
      }
    } catch (error) {
      console.error("API request failed:", error.message)
      throw error
    }
  }

  // ========================
  // 🔐 AUTH ENDPOINTS
  // ========================
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

  async changePass(credentials) {
    return this.request("/edit-pass", {
      method: "PUT",
      body: credentials,
    })
  }

  async changeInfo(credentials) {
    return this.request("/edit-info", {
      method: "PUT",
      body: credentials,
    })
  }

  // ========================
  // 👥 USER MANAGEMENT
  // ========================
  async getUsers() {
    return this.request("/user")
  }

  // ========================
  // 💰 BUDGET ENDPOINTS
  // ========================
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

  // ========================
  // 💸 EXPENSE ENDPOINTS
  // ========================
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

  // ========================
  // 💵 INCOME ENDPOINTS
  // ========================
  async addIncome(incomeData) {
    return this.request("/income/add", {
      method: "POST",
      body: incomeData,
    })
  }

  async editIncome(incomeData, id) {
    console.log("Editing income:", incomeData, id)
    return this.request(`/income/${id}`, {
      method: "PUT",
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

  // ========================
  // 🌐 GENERIC HTTP METHODS
  // ========================
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
