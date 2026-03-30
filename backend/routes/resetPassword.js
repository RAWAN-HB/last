require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb+srv://rawanhalbout_db_user:rawannouni19@cluster0.dylysbc.mongodb.net/stagdb?retryWrites=true&w=majority')
  .then(async () => {
    console.log('✅ Connected');

    const User = require('./models/User');

    // Check existing users
    const allUsers = await User.find().select('email role');
    console.log('📋 All users in DB:', allUsers);

    // Create admin
    const existing = await User.findOne({ email: 'admin@stagio.com' });
    if (existing) {
      existing.password = await bcrypt.hash('admin123', 10);
      existing.role = 'admin';
      existing.isApproved = true;
      await existing.save({ validateBeforeSave: false });
      console.log('✅ Admin password reset:', existing.email);
    } else {
      const hashed = await bcrypt.hash('admin123', 10);
      await User.collection.insertOne({
        name: 'Admin',
        email: 'admin@stagio.com',
        password: hashed,
        role: 'admin',
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ Admin created: admin@stagio.com / admin123');
    }

    mongoose.disconnect();
  })
  .catch(err => console.log('❌ Error:', err.message));