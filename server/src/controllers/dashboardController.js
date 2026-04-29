import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const projects = req.user.role === "admin"
      ? await Project.find().select("_id").sort({ createdAt: -1 })
      : await Project.find({ members: req.user._id }).select("_id").sort({ createdAt: -1 });
    const projectIds = projects.map((project) => project._id);

    const tasks = await Task.find({ projectId: { $in: projectIds } });
    const now = new Date();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === "done").length;
    const pendingTasks = tasks.filter((task) => task.status !== "done").length;
    const overdueTasks = tasks.filter((task) => task.status !== "done" && task.dueDate < now).length;

    // tasks by status
    const tasksByStatus = tasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    // tasks per user
    const userIds = [...new Set(tasks.map((t) => t.assignedTo.toString()))];
    const users = await Promise.all(userIds.map((id) => User.findById(id).select("name")));
    const tasksPerUser = users.map((u) => ({ userId: u._id, name: u.name, count: tasks.filter((t) => t.assignedTo.toString() === u._id.toString()).length }));

    return res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      tasksByStatus,
      tasksPerUser
    });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to fetch dashboard summary", error: error.message });
  }
};
