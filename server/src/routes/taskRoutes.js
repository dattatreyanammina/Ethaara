import { Router } from "express";
import { createTask, getTasksByProject, updateTask } from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/", protect, requireRole("admin"), createTask);
router.get("/:projectId", protect, getTasksByProject);
router.put("/:id", protect, updateTask);

export default router;
