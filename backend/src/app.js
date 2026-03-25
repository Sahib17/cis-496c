import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import groupRoutes from "./routes/group.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

const allowedOrigins = [
  "http://localhost:5173", // local dev
  process.env.FRONTEND_URL, // production frontend (Vercel)
];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
}
app.use(cors(corsOptions));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/groups', groupRoutes);
app.use('/expenses', expenseRoutes);
app.use('/notifications', notificationRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`[Error] ${message}`);
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
