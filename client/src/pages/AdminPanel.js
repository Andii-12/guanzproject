import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { API_URL } from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../fonts/NotoSans-normal.js';

import tsuivanImg from '../images/tsuivan.jpg';
import buuzImg from '../images/buuz.png';
import khuushuurImg from '../images/khuushuur.jpg';
import banshImg from '../images/bansh.jpg';
import lavshaImg from '../images/lavsha.jpg';
import piroshkiImg from '../images/piroshki.jpg';
import gulyashImg from '../images/gulyash.jpg';
import sholImg from '../images/shol.jpg';

const imageOptions = [
  { label: 'Цуйван', value: tsuivanImg },
  { label: 'Бууз', value: buuzImg },
  { label: 'Хуушуур', value: khuushuurImg },
  { label: 'Банш', value: banshImg },
  { label: 'Лавша', value: lavshaImg },
  { label: 'Пирошки', value: piroshkiImg },
  { label: 'Гуляш', value: gulyashImg },
  { label: 'Шөл', value: sholImg },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'preparing':
      return 'info';
    case 'ready':
      return 'success';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const AdminPanel = () => {
  const [orders, setOrders] = useState([]);
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '1-р хоол',
    image: imageOptions[0].value,
    customImage: '',
    special: false,
    specialOptions: [],
    specialInput: '',
  });
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [viewedDate, setViewedDate] = useState(new Date());
  const [reportPeriod, setReportPeriod] = useState('month'); // 'week', 'month', '3month', 'year', 'today'
  const [incomeViewedDate, setIncomeViewedDate] = useState(new Date());
  const [audio] = useState(new Audio('/notification.mp3'));
  const [knownOrderIds, setKnownOrderIds] = useState(new Set());
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showIncome, setShowIncome] = useState(false);
  const [showLoss, setShowLoss] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`);
      if (!response.data) {
        throw new Error('No data received');
      }

      if (isFirstLoad) {
        const initialOrderIds = new Set(response.data.map(order => order._id));
        setKnownOrderIds(initialOrderIds);
        setIsFirstLoad(false);
        setOrders(response.data);
        return;
      }

      // Play notification if there are new orders (on any tab)
      const newOrders = response.data.filter(order => !knownOrderIds.has(order._id));
      if (newOrders.length > 0) {
        audio.play().catch(error => {
          console.warn('Notification sound could not be played. Check if /notification.mp3 exists and user has interacted with the page.', error);
        });
        const newOrderIds = new Set(newOrders.map(order => order._id));
        setKnownOrderIds(prev => new Set([...prev, ...newOrderIds]));
      }

      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please refresh the page.');
    }
  }, [audio, isFirstLoad, knownOrderIds]);

  useEffect(() => {
    fetchFoods();
    fetchOrders();

    const orderPollingInterval = setInterval(fetchOrders, 3000);

    const handleError = (error) => {
      console.error('AdminPanel Error:', error);
      setError('An error occurred. Please refresh the page.');
    };

    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
      clearInterval(orderPollingInterval);
    };
  }, [fetchOrders]);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/menu`);
      if (!response.data) {
        throw new Error('No data received');
      }
      setFoods(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to fetch menu items. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId) return;
    
    try {
      console.log('Updating order status:', orderId, newStatus);
      const response = await axios.patch(`${API_URL}/orders/${orderId}/status`, { status: newStatus });
      if (!response.data) {
        throw new Error('No data received');
      }
      setOrders(orders.map(order => order._id === orderId ? response.data : order));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    }
  };

  const handleFoodFormChange = (e) => {
    const { name, value } = e.target;
    setFoodForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoodForm((prev) => ({ ...prev, customImage: reader.result, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpecialSwitch = (e) => {
    setFoodForm((prev) => ({ ...prev, special: e.target.checked, specialOptions: [], specialInput: '' }));
  };

  const handleSpecialInputChange = (e) => {
    setFoodForm((prev) => ({ ...prev, specialInput: e.target.value }));
  };

  const handleAddSpecialOption = () => {
    if (foodForm.specialInput.trim()) {
      setFoodForm((prev) => ({
        ...prev,
        specialOptions: [...prev.specialOptions, prev.specialInput.trim()],
        specialInput: '',
      }));
    }
  };

  const handleRemoveSpecialOption = (idx) => {
    setFoodForm((prev) => ({
      ...prev,
      specialOptions: prev.specialOptions.filter((_, i) => i !== idx),
    }));
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!foodForm.name || !foodForm.description || !foodForm.price || !foodForm.category) {
        setError('Please fill in all required fields');
        return;
      }

      const newFood = {
        name: foodForm.name,
        description: foodForm.description,
        price: Number(foodForm.price),
        category: foodForm.category,
        image: foodForm.customImage || foodForm.image, // Use custom image if available, otherwise use selected image
        special: foodForm.special,
        specialOptions: foodForm.special ? foodForm.specialOptions : [],
        isAvailable: true
      };

      const response = await axios.post(`${API_URL}/menu`, newFood);
      
      if (response.data) {
        setFoods([response.data, ...foods]);
        // Reset form
        setFoodForm({
          name: '',
          description: '',
          price: '',
          category: '1-р хоол',
          image: imageOptions[0].value,
          customImage: '',
          special: false,
          specialOptions: [],
          specialInput: '',
        });
        setError(null);
      }
    } catch (err) {
      console.error('Error adding food item:', err);
      setError(err.response?.data?.message || 'Failed to add food item. Please try again.');
    }
  };

  const handleDeleteFood = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/menu/${id}`);
      if (response.data.message === 'Menu item deleted successfully') {
        setFoods(foods.filter(food => food._id !== id));
        setError(null);
      } else {
        setError('Failed to delete food item');
      }
    } catch (err) {
      console.error('Error deleting food item:', err);
      setError(err.response?.data?.message || 'Failed to delete food item');
    }
  };

  const handleEditClick = (food) => {
    setEditForm({ ...food });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSave = async () => {
    try {
      const response = await axios.put(`${API_URL}/menu/${editForm._id}`, editForm);
      setFoods(foods.map(food => food._id === editForm._id ? response.data : food));
      setEditDialogOpen(false);
      setEditForm(null);
    } catch (err) {
      console.error('Error updating food item:', err);
      setError('Failed to update food item');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!orderId) return;
    
    try {
      await axios.delete(`${API_URL}/orders/${orderId}`);
      setOrders(orders.filter(order => (order._id || order.id) !== orderId));
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order. Please try again.');
    }
  };

  // Calculate income and loss from orders
  const completedOrders = orders.filter(order => order.status === 'completed');
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');
  const totalIncome = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalLoss = cancelledOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  // Filter orders by selected date (for Orders tab)
  const filteredOrders = orders.filter(order => {
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getFullYear() === viewedDate.getFullYear() &&
      orderDate.getMonth() === viewedDate.getMonth() &&
      orderDate.getDate() === viewedDate.getDate()
    );
  });

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const goToPreviousDay = () => {
    setViewedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const goToNextDay = () => {
    setViewedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const getReportOrders = () => {
    const now = new Date();
    let filtered = [];
    if (reportPeriod === 'today') {
      filtered = completedOrders.filter(order => {
        const d = new Date(order.createdAt);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      });
    } else if (reportPeriod === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 6);
      filtered = completedOrders.filter(order => {
        const d = new Date(order.createdAt);
        return d >= weekAgo && d <= now;
      });
    } else if (reportPeriod === 'month') {
      filtered = completedOrders.filter(order => {
        const d = new Date(order.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
    } else if (reportPeriod === '3month') {
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 2);
      threeMonthsAgo.setDate(1);
      filtered = completedOrders.filter(order => {
        const d = new Date(order.createdAt);
        return d >= threeMonthsAgo && d <= now;
      });
    } else if (reportPeriod === 'year') {
      filtered = completedOrders.filter(order => {
        const d = new Date(order.createdAt);
        return d.getFullYear() === now.getFullYear();
      });
    }
    // Sort by date descending
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.setFont('NotoSans', 'normal');
    doc.text('Сайн байна уу', 20, 20);
    doc.text(
      reportPeriod === 'today' ? 'Өнөөдөр' :
      reportPeriod === 'week' ? 'Сүүлийн 7 хоног' :
      reportPeriod === 'month' ? 'Энэ сар' :
      reportPeriod === '3month' ? 'Энэ 3 сар' :
      'Энэ жил',
      14,
      24
    );
    const orders = getReportOrders();
    const tableData = orders.map(order => [
      order._id?.slice(-6) || '-',
      order.createdAt ? format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm') : '-',
      order.tableNumber || '-',
      order.items?.map(i => {
        const name = i?.name || '';
        const qty = i?.quantity || 0;
        const special = i?.specialOption ? ` (${i.specialOption})` : '';
        return `${qty}x ${name}${special}`;
      }).join(', '),
      order.totalAmount?.toLocaleString?.() || '0',
    ]);
    autoTable(doc, {
      head: [['Order #', 'Date', 'Table', 'Items', 'Total']],
      body: tableData,
      startY: 30,
      styles: { font: 'NotoSans' }
    });
    doc.save(`income-report-${reportPeriod}.pdf`);
  };

  const goToIncomePreviousDay = () => {
    setIncomeViewedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const goToIncomeNextDay = () => {
    setIncomeViewedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const completedOrdersByDay = completedOrders.filter(order => {
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getFullYear() === incomeViewedDate.getFullYear() &&
      orderDate.getMonth() === incomeViewedDate.getMonth() &&
      orderDate.getDate() === incomeViewedDate.getDate()
    );
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const cancelledOrdersByDay = cancelledOrders.filter(order => {
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getFullYear() === incomeViewedDate.getFullYear() &&
      orderDate.getMonth() === incomeViewedDate.getMonth() &&
      orderDate.getDate() === incomeViewedDate.getDate()
    );
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalIncomeByDay = completedOrdersByDay.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalLossByDay = cancelledOrdersByDay.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="admin panel tabs">
          <Tab label="Income" />
          <Tab label="Menu" />
          <Tab label="Orders" />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button variant="contained" color="primary" onClick={handleDownloadReport}>
              Тайлан гаргах
            </Button>
            <Button
              variant={reportPeriod === 'today' ? 'contained' : 'outlined'}
              onClick={() => setReportPeriod('today')}
            >
              Өнөөдөр
            </Button>
            <Button
              variant={reportPeriod === 'week' ? 'contained' : 'outlined'}
              onClick={() => setReportPeriod('week')}
            >
              7 хоног
            </Button>
            <Button
              variant={reportPeriod === 'month' ? 'contained' : 'outlined'}
              onClick={() => setReportPeriod('month')}
            >
              1 сар
            </Button>
            <Button
              variant={reportPeriod === '3month' ? 'contained' : 'outlined'}
              onClick={() => setReportPeriod('3month')}
            >
              3 сар
            </Button>
            <Button
              variant={reportPeriod === 'year' ? 'contained' : 'outlined'}
              onClick={() => setReportPeriod('year')}
            >
              1 жил
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" gutterBottom>Нийт Орлого: {showIncome ? `₮${totalIncome.toLocaleString()}` : '****'}</Typography>
              <IconButton onClick={() => setShowIncome(v => !v)} size="small">
                {showIncome ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" gutterBottom>Нийт Алдагдал: {showLoss ? `₮${totalLoss.toLocaleString()}` : '****'}</Typography>
              <IconButton onClick={() => setShowLoss(v => !v)} size="small">
                {showLoss ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="outlined" onClick={goToIncomePreviousDay}>Previous Day</Button>
            <Typography variant="subtitle1">
              {incomeViewedDate.toLocaleDateString()} - Орлого: ₮{totalIncomeByDay.toLocaleString()} | Алдагдал: ₮{totalLossByDay.toLocaleString()}
            </Typography>
            <Button variant="outlined" onClick={goToIncomeNextDay}>Next Day</Button>
          </Box>
          <Card sx={{ mb: 4, backgroundColor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'green', fontWeight: 'bold' }}>
                Орлого (Income)
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 2, backgroundColor: '#f1f8e9' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Table</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {completedOrdersByDay.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>{order._id?.slice(-6) || '-'}</TableCell>
                        <TableCell>{order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm') : '-'}</TableCell>
                        <TableCell>{order.tableNumber || '-'}</TableCell>
                        <TableCell>
                          {order.items?.map((item, idx) => (
                            <Box key={idx} sx={{ mb: 0.5 }}>
                              {item.quantity}x {item.name}
                            </Box>
                          ))}
                        </TableCell>
                        <TableCell>₮{order.totalAmount?.toLocaleString?.() || '0'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
          <Card sx={{ mb: 4, backgroundColor: '#ffebee' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'red', fontWeight: 'bold' }}>
                Алдагдал (Loss)
              </Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: '#ffebee' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Table</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cancelledOrdersByDay.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>{order._id?.slice(-6) || '-'}</TableCell>
                        <TableCell>{order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm') : '-'}</TableCell>
                        <TableCell>{order.tableNumber || '-'}</TableCell>
                        <TableCell>
                          {order.items?.map((item, idx) => (
                            <Box key={idx} sx={{ mb: 0.5 }}>
                              {item.quantity}x {item.name}
                            </Box>
                          ))}
                        </TableCell>
                        <TableCell>₮{order.totalAmount?.toLocaleString?.() || '0'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}
      {tabIndex === 1 && (
        <Box>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Food
              </Typography>
              <Box component="form" onSubmit={handleAddFood} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField
                  label="Name"
                  name="name"
                  value={foodForm.name}
                  onChange={handleFoodFormChange}
                  required
                />
                <TextField
                  label="Description"
                  name="description"
                  value={foodForm.description}
                  onChange={handleFoodFormChange}
                  required
                />
                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  value={foodForm.price}
                  onChange={handleFoodFormChange}
                  required
                  inputProps={{ min: 0 }}
                />
                <FormControl sx={{ minWidth: 160 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={foodForm.category}
                    label="Category"
                    onChange={handleFoodFormChange}
                    required
                  >
                    <MenuItem value="Бүх хоол">Бүх хоол</MenuItem>
                    <MenuItem value="1-р хоол">1-р хоол</MenuItem>
                    <MenuItem value="2-р хоол">2-р хоол</MenuItem>
                    <MenuItem value="Захиалгат хоол">Захиалгат хоол</MenuItem>
                    <MenuItem value="Иж бүрдэл хоол">Иж бүрдэл хоол</MenuItem>
                    <MenuItem value="Багц хоол">Багц хоол</MenuItem>
                    <MenuItem value="Сет хоол">Сет хоол</MenuItem>
                    <MenuItem value="Ширхэгийн хоол">Ширхэгийн хоол</MenuItem>
                    <MenuItem value="Зууш">Зууш</MenuItem>
                    <MenuItem value="Ус Ундаа">Ус Ундаа</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 160 }}>
                  <InputLabel>Image</InputLabel>
                  <Select
                    name="image"
                    value={foodForm.image}
                    label="Image"
                    onChange={handleFoodFormChange}
                  >
                    {imageOptions.map((img) => (
                      <MenuItem key={img.label} value={img.value}>
                        {img.label}
                      </MenuItem>
                    ))}
                    {foodForm.customImage && (
                      <MenuItem value={foodForm.customImage}>Custom Image</MenuItem>
                    )}
                  </Select>
                </FormControl>
                <Button variant="outlined" component="label">
                  Upload Image
                  <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                </Button>
                <FormControlLabel
                  control={<Switch checked={foodForm.special} onChange={handleSpecialSwitch} />}
                  label="Special Options"
                  sx={{ ml: 2 }}
                />
                {foodForm.special && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 220 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        label="Add Option"
                        value={foodForm.specialInput}
                        onChange={handleSpecialInputChange}
                        size="small"
                      />
                      <Button variant="contained" onClick={handleAddSpecialOption} sx={{ minWidth: 40 }}>
                        +
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {foodForm.specialOptions.map((opt, idx) => (
                        <Chip
                          key={idx}
                          label={opt}
                          onDelete={() => handleRemoveSpecialOption(idx)}
                          color="secondary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                <Button type="submit" variant="contained" color="primary">
                  Add Food
                </Button>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Menu
              </Typography>
              <Grid container spacing={2}>
                {foods.map((food) => (
                  <Grid item xs={12} sm={6} md={4} key={food._id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={food.image}
                        alt={food.name}
                      />
                      <CardContent>
                        <Typography variant="h6">{food.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {food.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Category: {food.category}
                        </Typography>
                        {food.special && food.specialOptions.length > 0 && (
                          <Box sx={{ mt: 1, mb: 1 }}>
                            <Typography variant="caption" color="secondary">
                              Special: {food.specialOptions.join(', ')}
                            </Typography>
                          </Box>
                        )}
                        <Typography variant="h6" color="primary">
                          ₮{food.price.toLocaleString()}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <IconButton color="primary" onClick={() => handleEditClick(food)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteFood(food._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
            <DialogTitle>Edit Food</DialogTitle>
            {editForm && (
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
                <TextField
                  label="Name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  required
                />
                <TextField
                  label="Description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  required
                />
                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  value={editForm.price}
                  onChange={handleEditFormChange}
                  required
                  inputProps={{ min: 0 }}
                />
                <FormControl>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={editForm.category}
                    label="Category"
                    onChange={handleEditFormChange}
                    required
                  >
                    <MenuItem value="Бүх хоол">Бүх хоол</MenuItem>
                    <MenuItem value="1-р хоол">1-р хоол</MenuItem>
                    <MenuItem value="2-р хоол">2-р хоол</MenuItem>
                    <MenuItem value="Захиалгат хоол">Захиалгат хоол</MenuItem>
                    <MenuItem value="Иж бүрдэл хоол">Иж бүрдэл хоол</MenuItem>
                    <MenuItem value="Багц хоол">Багц хоол</MenuItem>
                    <MenuItem value="Сет хоол">Сет хоол</MenuItem>
                    <MenuItem value="Ширхэгийн хоол">Ширхэгийн хоол</MenuItem>
                    <MenuItem value="Зууш">Зууш</MenuItem>
                    <MenuItem value="Ус Ундаа">Ус Ундаа</MenuItem>
                  </Select>
                </FormControl>
                <FormControl>
                  <InputLabel>Image</InputLabel>
                  <Select
                    name="image"
                    value={editForm.image}
                    label="Image"
                    onChange={handleEditFormChange}
                  >
                    {imageOptions.map((img) => (
                      <MenuItem key={img.label} value={img.value}>
                        {img.label}
                      </MenuItem>
                    ))}
                    {editForm.image && editForm.image.startsWith('data:') && (
                      <MenuItem value={editForm.image}>Custom Image</MenuItem>
                    )}
                  </Select>
                </FormControl>
                <Button variant="outlined" component="label">
                  Upload Image
                  <input type="file" accept="image/*" hidden onChange={handleEditImageUpload} />
                </Button>
              </DialogContent>
            )}
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSave} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {tabIndex === 2 && (
        <Box>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="outlined" onClick={goToPreviousDay}>Previous Day</Button>
            <Typography variant="subtitle1">
              Orders for {viewedDate.toLocaleDateString()}
            </Typography>
            <Button variant="outlined" onClick={goToNextDay}>Next Day</Button>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Order #</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Table</TableCell>
                          <TableCell>Items</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order._id || order.id}>
                            <TableCell>{order._id?.slice(-6) || order.id?.slice(-6) || '-'}</TableCell>
                            <TableCell>
                              {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm') : '-'}
                            </TableCell>
                            <TableCell>{order.tableNumber || '-'}</TableCell>
                            <TableCell>
                              {order.items?.map((item, index) => (
                                <Box key={index} sx={{ mb: 0.5 }}>
                                  {item.quantity}x {item.name}
                                  {item.specialOption && (
                                    <Typography variant="caption" color="secondary" display="block">
                                      Special: {item.specialOption}
                                    </Typography>
                                  )}
                                </Box>
                              ))}
                            </TableCell>
                            <TableCell>₮{order.totalAmount?.toLocaleString?.() || '0'}</TableCell>
                            <TableCell>
                              <Chip
                                label={order.status === 'completed' ? 'done' : order.status === 'cancelled' ? 'canceled' : order.status}
                                color={getStatusColor(order.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleStatusChange(order._id, 'completed')}
                                  disabled={order.status === 'completed' || order.status === 'cancelled'}
                                >
                                  Done
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="warning"
                                  onClick={() => handleStatusChange(order._id, 'cancelled')}
                                  disabled={order.status === 'completed' || order.status === 'cancelled'}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleDeleteOrder(order._id)}
                                >
                                  Delete
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default AdminPanel; 