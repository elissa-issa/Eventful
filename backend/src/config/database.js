const mongoose = require('mongoose');

async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO;
  const databaseName = process.env.MONGODB_DB_NAME || 'eventful';

  if (!mongoUri) {
    throw new Error('MONGODB_URI or MONGO is required to start the backend');
  }

  await mongoose.connect(mongoUri, {
    dbName: databaseName,
  });
  console.log(`Connected to MongoDB database: ${databaseName}`);
}

module.exports = { connectToDatabase };
