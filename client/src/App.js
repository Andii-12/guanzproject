import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import store from './store';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrderSuccess from './pages/OrderSuccess';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import TableQRList from './components/TableQR';
import QRManager from './pages/admin/QRManager';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // vibrant blue
    },
    secondary: {
      main: '#ff4081', // pink accent
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: 'Poppins, Montserrat, Helvetica Neue, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
          transition: 'transform 0.15s',
          '&:hover': {
            backgroundColor: '#1565c0',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 16px rgba(25, 118, 210, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
          transition: 'transform 0.18s',
          '&:hover': {
            transform: 'scale(1.025)',
            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.18)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            >
              <Route index element={<TableQRList />} />
              <Route path="orders" element={<TableQRList />} />
              <Route path="qr-codes" element={<TableQRList />} />
              <Route path="qr" element={<QRManager />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App; 