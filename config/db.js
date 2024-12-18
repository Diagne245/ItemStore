const mongoose = require('mongoose');
require('dotenv').config();

// -----------
const connectDB = async (userName) => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};


module.exports = connectDB;
