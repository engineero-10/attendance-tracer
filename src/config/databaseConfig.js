import mongoose from "mongoose";

async function connectToMongo(uri) {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

mongoose.connection.on("connected", () => {
  console.log("✓ Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.log("✗ Mongoose connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("✗ Mongoose disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});

export {connectToMongo}
