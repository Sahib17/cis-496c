import express from "express";
import {
  deleteUser,
  getUserById,
  getUserByMail,
  patchUser,
  getBalanceSummary
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import imagekit from "../utils/imagekit.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("hi");
});

// ⚠️ Must be before /:id
router.get("/balance-summary", isLoggedIn, getBalanceSummary);

// GET a user by email
router.post("/", isLoggedIn, getUserByMail);

// UPDATE logged in user
router.patch("/", isLoggedIn, patchUser);

// DELETE (soft delete) logged in user
router.patch("/delete", isLoggedIn, deleteUser);

router.post("/image", isLoggedIn, (req, res) => {
  const authParams = imagekit.getAuthenticationParameters();
  res.status(200).json(authParams);
});

// GET a user by userId — must be LAST
router.get("/:id", isLoggedIn, getUserById);

export default router;