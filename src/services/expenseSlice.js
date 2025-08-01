import { createSlice } from "@reduxjs/toolkit";

const expense = createSlice({
  name: "expense",
  initialState:[],
  reducers: {
    // Add item to the cart
    setItem: (state, action) => {
      state.products = action.payload;
    },
    
    addItem: (state, action) => {
        const existingItem = state.products.find((item) => item.id === action.payload.id);
        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 0) + 1; // Increment quantity
        } else {
          state.products.push({ ...action.payload, quantity: 1 }); // Add new item with default quantity
        }
      },
    // Remove item from the cart
    removeItem: (state, action) => {
      state.products = state.products.filter((item) => item.id !== action.payload);
    },
   
  },
});

// Export actions
export const { addItem, removeItem, setCart} = expense.actions;

// Export reducer
export default expense.reducer;