import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Project } from "./models/Project.js";
import { Task } from "./models/Task.js";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();
    await Promise.all([
      User.syncIndexes(),
      Project.syncIndexes(),
      Task.syncIndexes()
    ]);
    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
