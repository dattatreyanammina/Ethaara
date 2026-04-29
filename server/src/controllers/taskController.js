import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";

const isProjectMember = (project, userId) =>
  project.members.some((memberId) => memberId.toString() === userId.toString());

export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, status, dueDate, priority } = req.body;

    if (!title || !projectId || !assignedTo || !dueDate) {
      return res.status(400).json({ msg: "title, projectId, assignedTo and dueDate are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ msg: "Invalid projectId or assignedTo" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({ msg: "Assigned user not found" });
    }

    if (!isProjectMember(project, assignedTo)) {
      return res.status(400).json({ msg: "Assigned user is not part of this project" });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      status: status || "todo",
      dueDate,
      priority: priority || "medium"
    });

    const populated = await task.populate([
      { path: "projectId", select: "title" },
      { path: "assignedTo", select: "name email role" }
    ]);

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ msg: "Failed to create task", error: error.message });
  }
};

export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ msg: "Invalid projectId" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const tasks = await Task.find({ projectId })
      .populate("assignedTo", "name email role")
      .sort({ dueDate: 1, createdAt: -1 });

    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ msg: "Failed to fetch tasks", error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, dueDate, assignedTo, priority } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid task id" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    const project = await Project.findById(task.projectId);
    if (!project || !isProjectMember(project, req.user._id)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const isAdmin = req.user.role === "admin";
    const isAssignedMember = task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedMember) {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (!isAdmin) {
      if (status) {
        task.status = status;
      }
    } else {
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (dueDate) task.dueDate = dueDate;
      if (priority) task.priority = priority;
      if (status) task.status = status;
      if (assignedTo) {
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
          return res.status(400).json({ msg: "Invalid assignedTo" });
        }
        if (!isProjectMember(project, assignedTo)) {
          return res.status(400).json({ msg: "Assigned user is not in this project" });
        }
        task.assignedTo = assignedTo;
      }
    }

    await task.save();

    const populated = await task.populate([
      { path: "projectId", select: "title" },
      { path: "assignedTo", select: "name email role" }
    ]);

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ msg: "Failed to update task", error: error.message });
  }
};
