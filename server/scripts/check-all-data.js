import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://yousef:123@cluster0.n2znjhu.mongodb.net/Educational';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to:', mongoose.connection.db.databaseName);
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(`\n${col.name}: ${count} documents`);
    
    if (count > 0 && count <= 5) {
      const docs = await mongoose.connection.db.collection(col.name).find({}).limit(5).toArray();
      docs.forEach(doc => {
        console.log(`  - ${doc.title || doc.email || doc._id}`);
      });
    }
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
