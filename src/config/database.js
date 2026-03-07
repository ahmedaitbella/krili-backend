import mongoose from "mongoose";
import { mongoURI } from "./env.js";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error", err);
    throw err;
  }
};

export default connectDB;
