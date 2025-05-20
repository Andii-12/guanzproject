import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  IconButton,
  Box,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/orderSlice';
import { RESTAURANT_ID } from '../config';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, tableNumber } = useSelector((state) => state.cart);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

  // Calculate total with null checks
  const total = items?.reduce((sum, item) => {
    const itemPrice = item?.price || 0;
    const itemQuantity = item?.quantity || 0;
    return sum + (itemPrice * itemQuantity);
  }, 0) || 0;

  useEffect(() => {
    const handleError = (error) => {
      console.error('Cart Error:', error);
      setError('An error occurred. Please try again.');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleCheckout = async () => {
    if (!items || items.length === 0) return;
    
    setIsProcessingPayment(true);
    setError(null);
    try {
      const orderData = {
        restaurantId: RESTAURANT_ID,
        items: items.map(item => ({
          menuItem: item._id || item.id,
          name: item.name || '',
          price: item.price || 0,
          quantity: item.quantity || 0,
          specialOption: item.specialOption || item.special || '',
          specialInstructions: item.specialOption || item.special || ''
        })),
        totalAmount: total,
        paymentMethod: 'cash',
        tableNumber: tableNumber ? String(tableNumber) : "0",
      };

      if (!orderData.items.every(item => item.name && item.price && item.quantity)) {
        throw new Error('Invalid order data');
      }

      const result = await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      
      // Navigate to success page with order ID
      navigate(`/order-success/${result._id}?table=${tableNumber || ''}`);
    } catch (error) {
      console.error('Checkout Error:', error);
      setError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/menu')}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      <Typography variant="h4" gutterBottom>
        {tableNumber ? `Table ${tableNumber} - Cart` : 'Your Cart'}
      </Typography>
      {tableNumber && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Order for Table {tableNumber}
        </Alert>
      )}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
        <List>
          {items.map((item) => (
            <React.Fragment key={item._id || item.id}>
              <ListItem sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                <ListItemText
                  primary={item.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        ₮{item.price?.toFixed(2) || '0.00'} x {item.quantity || 0}
                      </Typography>
                      {item.specialOption && (
                        <Typography component="span" variant="body2" display="block">
                          Special: {item.specialOption}
                        </Typography>
                      )}
                    </>
                  }
                />
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mr: 2,
                  mt: { xs: 1, sm: 0 },
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: { xs: 'space-between', sm: 'flex-start' }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      aria-label="decrease"
                      onClick={() => handleQuantityChange(item._id || item.id, (item.quantity || 0) - 1)}
                      disabled={!item.quantity || item.quantity <= 1}
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography variant="body1" sx={{ mx: 1 }}>
                      {item.quantity || 0}
                    </Typography>
                    <IconButton
                      aria-label="increase"
                      onClick={() => handleQuantityChange(item._id || item.id, (item.quantity || 0) + 1)}
                      size="small"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveItem(item._id || item.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Typography variant="h6" gutterBottom>
            Total: ₮{total.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckout}
            fullWidth
            sx={{ mt: 2 }}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              'Checkout'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Cart; 