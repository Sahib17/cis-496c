import express from "express";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { getNotification, postNotification } from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/", isLoggedIn, postNotification);
router.get("/", isLoggedIn, getNotification);

export default router;