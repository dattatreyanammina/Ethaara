import { User } from "../models/User.js";

export const getUsers = async (_req, res) => {
  try {
    const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ msg: "Failed to fetch users", error: error.message });
  }
};