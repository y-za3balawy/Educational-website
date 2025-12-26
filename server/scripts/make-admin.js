/**
 * Script to promote a user to admin role
 * Run from server folder: node scripts/make-admin.js
 */

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://yousef:123@cluster0.n2znjhu.mongodb.net/Educational';

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  firstName: String,
  lastName: String
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function makeAdmin() {
  const email = 'yzabalawy@gmail.com';
  
  console.log('Connecting to MongoDB...');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email "${email}" not found`);
      process.exit(1);
    }

    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    user.role = 'admin';
    await user.save();

    console.log(`✅ User role updated to: admin`);
    console.log('Log out and log back in to use admin features!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

makeAdmin();
