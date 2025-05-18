import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Drawer,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useDispatch } from 'react-redux';
import { addToCart, setTableNumber } from '../store/slices/cartSlice';
import { useLocation } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const Menu = () => {
  const dispatch = useDispatch();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [flyImage, setFlyImage] = useState(null);
  const [flyStyle, setFlyStyle] = useState({});
  const cartIconRef = useRef(null);
  const [specialDialog, setSpecialDialog] = useState({ open: false, food: null });
  const [selectedSpecial, setSelectedSpecial] = useState('');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tableNumber = searchParams.get('table') || "0";
  const [cartOpen, setCartOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'Бүх хоол' },
    { id: '1-р хоол', name: '1-р хоол' },
    { id: '2-р хоол', name: '2-р хоол' },
    { id: 'ширхэгийн хоол', name: 'Ширхэгийн хоол' },
    { id: 'Ус, ундаа, цай', name: 'Ус, ундаа, цай' }
  ];

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/menu');
        setFoods(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch menu items. Please try again later.');
        console.error('Error fetching menu items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Find the cart icon in the Navbar
  useEffect(() => {
    cartIconRef.current = document.querySelector('.MuiBadge-root .MuiSvgIcon-root');
  }, []);

  // Set table number when component mounts or URL changes
  useEffect(() => {
    if (tableNumber) {
      dispatch(setTableNumber(tableNumber));
    }
  }, [tableNumber, dispatch]);

  const handleAddToCart = (item, e, special = null) => {
    let foodToAdd = { ...item };
    if (special) {
      foodToAdd = {
        ...foodToAdd,
        description: `${item.description} + ${special}`,
        price: item.price + 1000,
        special: special,
        specialOption: special,
        specialInstructions: special,
      };
    }
    dispatch(addToCart(foodToAdd));
    // Animation
    let imgRect = null;
    if (e && e.currentTarget) {
      try {
        imgRect = e.currentTarget.parentNode.parentNode.parentNode.querySelector('img').getBoundingClientRect();
      } catch {}
    }
    if (!imgRect && item.name) {
      const imgEl = document.querySelector(`img[alt='${item.name}']`);
      if (imgEl) {
        imgRect = imgEl.getBoundingClientRect();
      }
    }
    let cartRect = cartIconRef.current?.getBoundingClientRect();
    // Fallback: if cart icon not found, animate to top-right
    if (!cartRect) {
      cartRect = { left: window.innerWidth - 60, top: 20, width: 40, height: 40 };
      console.warn('Cart icon not found for animation. Using fallback position.');
    }
    if (cartRect && imgRect) {
      setFlyImage(item.image);
      setFlyStyle({
        position: 'fixed',
        left: imgRect.left,
        top: imgRect.top,
        width: 80,
        height: 80,
        zIndex: 9999,
        borderRadius: '50%',
        pointerEvents: 'none',
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)',
        opacity: 1,
        transition: 'all 1s cubic-bezier(.4,2,.6,1), opacity 0.5s',
      });
      setTimeout(() => {
        setFlyStyle((prev) => ({
          ...prev,
          left: cartRect.left + cartRect.width / 2 - 20,
          top: cartRect.top + cartRect.height / 2 - 20,
          width: 40,
          height: 40,
          opacity: 0.3,
        }));
      }, 10);
      setTimeout(() => {
        setFlyImage(null);
      }, 1100);
    }
  };

  const handleOpenSpecialDialog = (food) => {
    setSelectedSpecial('');
    setSpecialDialog({ open: true, food });
  };

  const handleCloseSpecialDialog = () => {
    setSpecialDialog({ open: false, food: null });
    setSelectedSpecial('');
  };

  const handleConfirmSpecial = (e) => {
    if (specialDialog.food && selectedSpecial) {
      handleAddToCart(specialDialog.food, e, selectedSpecial);
      handleCloseSpecialDialog();
    }
  };

  const filteredFoods = selectedCategory === 'all' 
    ? foods 
    : foods.filter(food => food.category === selectedCategory);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {tableNumber && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Table {tableNumber}
          </Typography>
          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
            Your order will be associated with Table {tableNumber}
          </Alert>
        </Box>
      )}
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, position: 'relative' }}>
        <Typography variant="h4" gutterBottom>
          Food Menu
        </Typography>
        
        {/* Category Filter */}
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          gap: 1, 
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-start' }
        }}>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "contained" : "outlined"}
              onClick={() => setSelectedCategory(category.id)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                minWidth: { xs: 'auto', sm: 120 }
              }}
            >
              {category.name}
            </Button>
          ))}
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {filteredFoods.map((item) => (
            <Grid item key={item._id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image}
                  alt={item.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ flexGrow: 1 }}>
                    {item.description}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mt: 2, 
                    gap: 1,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
                  }}>
                    <Typography variant="h6" color="primary" sx={{ minWidth: 'fit-content' }}>
                      ₮{item.price.toLocaleString()}
                    </Typography>
                    {item.special && item.specialOptions && item.specialOptions.length > 0 && (
                      <IconButton color="secondary" onClick={() => handleOpenSpecialDialog(item)}>
                        <AddCircleOutlineIcon />
                      </IconButton>
                    )}
                    <Button 
                      variant="contained" 
                      onClick={(e) => handleAddToCart(item, e)}
                      fullWidth={false}
                      sx={{ 
                        minWidth: { xs: '100%', sm: 'auto' },
                        mt: { xs: 1, sm: 0 }
                      }}
                    >
                      Захиалганд оруулах
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {flyImage && (
          <img src={flyImage} alt="fly" style={flyStyle} />
        )}
        <Dialog
          open={specialDialog.open}
          onClose={handleCloseSpecialDialog}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Тусгай нэмэлт сонгох</DialogTitle>
          <DialogContent>
            <RadioGroup
              value={selectedSpecial}
              onChange={(e) => setSelectedSpecial(e.target.value)}
            >
              {specialDialog.food && specialDialog.food.specialOptions &&
                specialDialog.food.specialOptions.map((opt, idx) => (
                  <FormControlLabel
                    key={idx}
                    value={opt}
                    control={<Radio />}
                    label={`${opt} (+₮1,000)`}
                  />
                ))}
            </RadioGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSpecialDialog}>Болих</Button>
            <Button
              variant="contained"
              disabled={!selectedSpecial}
              onClick={handleConfirmSpecial}
            >
              Нэмэх
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* Cart Drawer */}
      <Drawer
        anchor="right"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {tableNumber ? `Table ${tableNumber} - Cart` : 'Cart'}
            </Typography>
            <IconButton onClick={() => setCartOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          {/* ... rest of cart content ... */}
        </Box>
      </Drawer>
    </Box>
  );
};

export default Menu; 