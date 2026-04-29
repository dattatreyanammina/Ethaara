import { Router } from "express";
import { getUsers } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", protect, requireRole("admin"), getUsers);

export default router;