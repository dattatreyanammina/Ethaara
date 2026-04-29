import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Project } from "./models/Project.js";
import { Task } from "./models/Task.js";

dotenv.config();

const startServer = async () => {
  try {
    console.log("🚀 Starting server...");

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    await connectDB();
    console.log("✅ Database connected");

    await Promise.all([
      User.syncIndexes(),
      Project.syncIndexes(),
      Task.syncIndexes()
    ]);
    console.log("✅ Indexes synced");

    const port = process.env.PORT || 5000;

    app.listen(port, "0.0.0.0", () => {
      console.log(`🔥 Server running on port ${port}`);
    });

  } catch (error) {
    console.error("❌ Server failed to start:");
    console.error(error); // 👈 full error (not just message)
    process.exit(1);
  }
};

startServer();