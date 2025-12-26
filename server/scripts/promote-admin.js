import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://yousef:123@cluster0.n2znjhu.mongodb.net/Educational';

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  firstName: String,
  lastName: String
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected');
  
  const user = await User.findOne({ email: 'yzabalawy@gmail.com' });
  if (!user) {
    console.log('User not found');
    process.exit(1);
  }
  
  console.log('Found:', user.firstName, user.lastName, '- Role:', user.role);
  user.role = 'admin';
  await user.save();
  console.log('Updated to admin!');
  
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(console.error);
