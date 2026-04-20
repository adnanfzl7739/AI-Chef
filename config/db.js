// config/db.js — MongoDB connection via Mongoose
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected 🚀");
  } catch (error) {
    console.error("MongoDB error:", error);
    
  }
};

export default connectDB;

//1tOif59lHNYgUBrZ
