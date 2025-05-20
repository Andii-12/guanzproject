const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function resetPassword() {
  await mongoose.connect('mongodb://localhost:27017/food-ordering');
  const password = 'newpassword123'; // Set your new password here
  const hash = await bcrypt.hash(password, 10);
  const result = await User.updateOne({ username: 'admin' }, { password: hash });
  if (result.modifiedCount === 1 || result.nModified === 1) {
    console.log('Password updated for admin!');
  } else {
    console.log('No admin user found or password not updated.');
  }
  mongoose.disconnect();
}

resetPassword();