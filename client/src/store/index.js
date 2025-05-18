import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import restaurantReducer from './slices/restaurantSlice';
import adminAuthReducer from './slices/adminAuthSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    order: orderReducer,
    restaurant: restaurantReducer,
    adminAuth: adminAuthReducer,
  },
});

export default store; 