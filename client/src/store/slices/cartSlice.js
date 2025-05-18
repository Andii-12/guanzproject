import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  tableNumber: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(
        item => (item._id || item.id) === (newItem._id || newItem.id) && item.specialOption === newItem.specialOption
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...newItem, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => (item._id || item.id) !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => (item._id || item.id) === id);
      if (item) {
        item.quantity = quantity;
      }
    },
    setTableNumber: (state, action) => {
      state.tableNumber = action.payload ? String(action.payload) : "0";
    },
    clearCart: (state) => {
      state.items = [];
      state.tableNumber = null;
    },
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  setTableNumber,
  clearCart 
} = cartSlice.actions;

export default cartSlice.reducer; 