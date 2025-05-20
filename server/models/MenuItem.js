const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['1-р хоол', '2-р хоол', 'ширхэгийн хоол', 'Ус, ундаа, цай']
  },
  image: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Allow URLs, base64, and relative paths starting with /static/
        return v.startsWith('http') || v.startsWith('data:image') || v.startsWith('/static/');
      },
      message: props => `${props.value} is not a valid image URL, base64 data, or static path!`
    }
  },
  special: {
    type: Boolean,
    default: false
  },
  specialOptions: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add index for better query performance
menuItemSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema, 'food_menu'); 