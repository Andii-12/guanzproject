import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tableNumber = searchParams.get('table');

  // Get last 6 characters of order ID for display
  const displayOrderId = orderId ? orderId.slice(-6) : '';

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <CheckCircleIcon
              sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
            />
            <Typography variant="h4" gutterBottom>
              Захиалга амжилттай хийгдлээ
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.2rem', mb: 2 }}>
              та хоолоо хүлээгээд сууж байгаарай
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Захиалгын дугаар:
            </Typography>
            <Typography
              variant="h4"
              color="primary"
              sx={{ fontFamily: 'monospace', mb: 4 }}
            >
              #{displayOrderId}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Таны захиалга амжилттай хийгдлээ. Захиалгын төлөвийг дээрх дугаараар хянах боломжтой.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(tableNumber ? `/menu?table=${tableNumber}` : '/menu')}
              sx={{ mt: 2 }}
            >
              Цэс рүү буцах
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrderSuccess; 