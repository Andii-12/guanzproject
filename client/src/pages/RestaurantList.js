import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { fetchRestaurants } from '../store/slices/restaurantSlice';
import { addToCart } from '../store/slices/cartSlice';

const RestaurantList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { restaurants, loading, error } = useSelector((state) => state.restaurant);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  const handleAddToCart = (item) => {
    dispatch(addToCart(item));
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
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mongolian Food Menu
      </Typography>
      <Grid container spacing={3}>
        {restaurants.map((restaurant) => (
          <Grid item key={restaurant._id} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/restaurants/${restaurant._id}`)}
            >
              <CardMedia
                component="img"
                height="200"
                image={restaurant.images?.[0] || 'https://via.placeholder.com/400x200'}
                alt={restaurant.name}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {restaurant.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                >
                  {restaurant.cuisine}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {restaurant.address.city}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/restaurants/${restaurant._id}`);
                    }}
                  >
                    View Menu
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default RestaurantList; 