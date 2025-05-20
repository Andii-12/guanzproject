const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ isAvailable: true })
      .sort({ category: 1, name: 1 });
    
    if (!menuItems || menuItems.length === 0) {
      return res.status(200).json([]);
    }
    
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ 
      message: 'Error fetching menu items', 
      error: error.message 
    });
  }
});

// Get menu items by category
router.get('/category/:category', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ 
      category: req.params.category,
      isAvailable: true 
    }).sort({ name: 1 });
    
    if (!menuItems || menuItems.length === 0) {
      return res.status(200).json([]);
    }
    
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items by category:', error);
    res.status(500).json({ 
      message: 'Error fetching menu items', 
      error: error.message 
    });
  }
});

// Create new menu item
router.post('/', async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    const savedMenuItem = await menuItem.save();
    res.status(201).json(savedMenuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(400).json({ 
      message: 'Error creating menu item', 
      error: error.message 
    });
  }
});

// Update menu item
router.put('/:id', async (req, res) => {
  try {
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(updatedMenuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(400).json({ 
      message: 'Error updating menu item', 
      error: error.message 
    });
  }
});

// Delete menu item (hard delete)
router.delete('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(400).json({ 
      message: 'Error deleting menu item', 
      error: error.message 
    });
  }
});

module.exports = router; 