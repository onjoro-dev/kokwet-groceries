import mongoose from "mongoose";

/**
 * Connects to MongoDB using the URI from environment variables.
 * Exits the process if the connection fails, since the API is useless without a database.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in your .env file");
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", (error as Error).message);
    process.exit(1);
  }
};
