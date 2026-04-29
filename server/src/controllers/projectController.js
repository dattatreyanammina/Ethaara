import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";

export const createProject = async (req, res) => {
  try {
    const { title, description, members = [] } = req.body;

    if (!title) {
      return res.status(400).json({ msg: "title is required" });
    }

    const validMemberIds = members.filter((id) => mongoose.Types.ObjectId.isValid(id));
    const existingMembers = await User.find({ _id: { $in: validMemberIds } }).select("_id");

    const memberSet = new Set(existingMembers.map((member) => member._id.toString()));
    memberSet.add(req.user._id.toString());

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: [...memberSet]
    });

    const populated = await project.populate([
      { path: "createdBy", select: "name email role" },
      { path: "members", select: "name email role" }
    ]);

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ msg: "Failed to create project", error: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const query = req.user.role === "admin"
      ? { members: req.user._id }
      : { members: req.user._id };

    const projects = await Project.find(query)
      .populate("createdBy", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    return res.json(projects);
  } catch (error) {
    return res.status(500).json({ msg: "Failed to fetch projects", error: error.message });
  }
};

export const updateProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, memberId } = req.body; // action: 'add' | 'remove'

    if (!id || !memberId) {
      return res.status(400).json({ msg: "project id and memberId required" });
    }

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    // Only allow admins (middleware already enforces)

    if (action === "add") {
      if (!project.members.includes(memberId)) {
        project.members.push(memberId);
      }
    } else if (action === "remove") {
      project.members = project.members.filter((m) => m.toString() !== memberId.toString());
    } else {
      return res.status(400).json({ msg: "Invalid action" });
    }

    await project.save();
    const populated = await project.populate([{ path: "createdBy", select: "name email role" }, { path: "members", select: "name email role" }]);
    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ msg: "Failed to update project members", error: error.message });
  }
};
