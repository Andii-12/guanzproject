const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  await mongoose.connect('mongodb://localhost:27017/food-ordering'); // Change <your-db-name> to your actual DB name

  const username = 'admin2';
  const password = 'admin123';
  const email = 'admin2@example.com'; // You can change this if you want

  // Check if admin already exists
  const existing = await User.findOne({ username });
  if (existing) {
    console.log('Admin user already exists!');
    mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = new User({
    username,
    name: 'Admin2',
    email,
    password: hashedPassword,
    role: 'admin'
  });

  await admin.save();
  console.log('Admin user created!');
  mongoose.disconnect();
}

createAdmin().catch(console.error); 