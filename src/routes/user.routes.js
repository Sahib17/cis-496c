// GET    /users/:id
// PUT    /users/:id
// DELETE /users/:id
import express from "express";
import {
  deleteUser,
  getUserById,
  getUserByMail,
  patchUser,
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import imagekit from "../utils/imagekit.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("hi");
});

// GET a user by userId
router.get("/:id", isLoggedIn, getUserById);

// GET a user by email
router.post("/", isLoggedIn, getUserByMail);

// UPDATE logged in user
router.patch("/", isLoggedIn, patchUser);

// DELETE (actually update) logged in user
router.patch("/delete", isLoggedIn, deleteUser);

router.post("/image", isLoggedIn, (req, res) => {
  const authParams = imagekit.getAuthenticationParameters();
  res.status(200).json(authParams);
});

export default router;
