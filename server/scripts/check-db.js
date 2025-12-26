import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://yousef:123@cluster0.n2znjhu.mongodb.net/Educational';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to:', mongoose.connection.db.databaseName);
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(`  ${col.name}: ${count} documents`);
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
