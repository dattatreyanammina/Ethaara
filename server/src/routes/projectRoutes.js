import { Router } from "express";
import { createProject, getProjects, updateProjectMembers } from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/", protect, requireRole("admin"), createProject);
router.get("/", protect, getProjects);
router.patch("/:id/members", protect, requireRole("admin"), updateProjectMembers);

export default router;
