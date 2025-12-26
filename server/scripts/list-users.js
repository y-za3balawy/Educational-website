import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://yousef:123@cluster0.n2znjhu.mongodb.net/Educational';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected');
  
  const users = await User.find({}).select('email firstName lastName role').limit(10);
  console.log('Users in database:');
  users.forEach(u => console.log(`- ${u.email} (${u.firstName} ${u.lastName}) - ${u.role}`));
  
  await mongoose.disconnect();
}

run().catch(console.error);
