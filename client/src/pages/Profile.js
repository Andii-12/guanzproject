import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { getProfile } from '../store/slices/authSlice';
import { fetchUserOrders } from '../store/slices/orderSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { orders, loading: ordersLoading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getProfile());
    dispatch(fetchUserOrders());
  }, [dispatch]);

  if (authLoading || ordersLoading) {
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

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Profile Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{user.name}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/orders')}
                sx={{ mt: 2 }}
              >
                View Order History
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Recent Orders
              </Typography>
              <Divider sx={{ my: 2 }} />
              {orders.length === 0 ? (
                <Typography color="text.secondary">
                  No orders found
                </Typography>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <Box key={order._id} sx={{ mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1">
                          Order #{order._id.slice(-6)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body1">
                          ${order.total.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/orders/${order._id}`)}
                        >
                          View Details
                        </Button>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 