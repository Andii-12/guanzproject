import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Divider,
  CircularProgress,
  Chip,
} from '@mui/material';
import { fetchUserOrders, cancelOrder } from '../store/slices/orderSlice';

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'preparing':
      return 'info';
    case 'ready':
      return 'success';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const handleCancelOrder = async (orderId) => {
    try {
      await dispatch(cancelOrder(orderId)).unwrap();
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      {orders.length === 0 ? (
        <Card>
          <CardContent>
            <Typography align="center" color="text.secondary">
              No orders found
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">
                        Order #{order._id.slice(-6)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                        />
                        <Typography variant="h6">
                          ${order.total.toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    {order.items.map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={item.image || 'https://via.placeholder.com/50'}
                            alt={item.name}
                            style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '4px',
                              marginRight: '12px',
                            }}
                          />
                          <Box>
                            <Typography variant="subtitle1">
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      View Details
                    </Button>
                    {order.status === 'pending' && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Orders; 