const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-ordering';

const restaurantData = {
  name: 'Guanz Restaurant',
  description: 'Authentic Mongolian cuisine',
  cuisine: 'Mongolian',
  address: {
    street: '123 Main St',
    city: 'Ulaanbaatar',
    state: 'Ulaanbaatar',
    zipCode: '14200'
  },
  phone: '+976 1234 5678',
  email: 'info@guanz.com',
  openingHours: {
    monday: { open: '09:00', close: '22:00' },
    tuesday: { open: '09:00', close: '22:00' },
    wednesday: { open: '09:00', close: '22:00' },
    thursday: { open: '09:00', close: '22:00' },
    friday: { open: '09:00', close: '23:00' },
    saturday: { open: '10:00', close: '23:00' },
    sunday: { open: '10:00', close: '22:00' }
  },
  menu: [
    {
      name: 'Tsuivan',
      description: 'Traditional Mongolian stir-fried noodles with meat and vegetables',
      price: 15000,
      category: 'main',
      image: 'https://example.com/tsuivan.jpg',
      available: true
    },
    {
      name: 'Khuushuur',
      description: 'Deep-fried meat dumplings',
      price: 8000,
      category: 'main',
      image: 'https://example.com/khuushuur.jpg',
      available: true
    },
    {
      name: 'Bansh',
      description: 'Steamed meat dumplings',
      price: 10000,
      category: 'main',
      image: 'https://example.com/bansh.jpg',
      available: true
    },
    {
      name: 'Suutei Tsai',
      description: 'Traditional Mongolian milk tea',
      price: 3000,
      category: 'beverage',
      image: 'https://example.com/suutei-tsai.jpg',
      available: true
    }
  ],
  rating: 4.5,
  images: [
    'https://example.com/restaurant1.jpg',
    'https://example.com/restaurant2.jpg'
  ],
  isActive: true
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Restaurant.deleteMany({});
    console.log('Cleared existing restaurants');

    // Create new restaurant
    const restaurant = await Restaurant.create(restaurantData);
    console.log('Created restaurant:', restaurant._id);

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed(); 