import { Router } from "express";
import { createProject, deleteProject, getProjects, updateProject, updateProjectMembers } from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/", protect, requireRole("admin"), createProject);
router.get("/", protect, getProjects);
router.put("/:id", protect, requireRole("admin"), updateProject);
router.delete("/:id", protect, requireRole("admin"), deleteProject);
router.patch("/:id/members", protect, requireRole("admin"), updateProjectMembers);

export default router;
