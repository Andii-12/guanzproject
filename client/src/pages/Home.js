import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Оч зоогийн газарт тавтай морилно уу
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
        Та дуртай хоолныхоо захиалгыг өгөөрэй
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/menu')}
            sx={{ mr: 2 }}
          >
            Меню үзэх
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 