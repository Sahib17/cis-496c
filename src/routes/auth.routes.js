// POST   /auth/register
// POST   /auth/login
// POST   /auth/logout
// GET    /auth/me

import express from "express";
import {login, logout, me, register, sendMail } from "../controllers/auth.controller.js";
const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

router.get('/me', me);

router.post('/sendMail', sendMail)

export default router;

function aFunction(){

}