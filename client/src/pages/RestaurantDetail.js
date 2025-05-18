import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Box,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import {
  fetchRestaurantById,
  fetchRestaurantMenu,
} from '../store/slices/restaurantSlice';
import { addToCart } from '../store/slices/cartSlice';

const RestaurantDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentRestaurant, menu, loading, error } = useSelector(
    (state) => state.restaurant
  );

  useEffect(() => {
    dispatch(fetchRestaurantById(id));
    dispatch(fetchRestaurantMenu(id));
  }, [dispatch, id]);

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
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!currentRestaurant) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            {currentRestaurant.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {currentRestaurant.description}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Menu
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {menu.map((item) => (
              <Grid item key={item._id} xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image || 'https://via.placeholder.com/400x200'}
                    alt={item.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom>
                      {item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                      sx={{ flexGrow: 1 }}
                    >
                      {item.description}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                        gap: 1
                      }}
                    >
                      <Typography variant="h6" color="primary" sx={{ minWidth: 'fit-content' }}>
                        ₮{item.price.toLocaleString()}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddToCart(item)}
                        fullWidth={false}
                        sx={{ 
                          minWidth: { xs: '100%', sm: 'auto' },
                          mt: { xs: 1, sm: 0 }
                        }}
                      >
                        Add to Cart
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RestaurantDetail; 