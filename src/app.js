import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import googleRoutes from "./routes/google.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import userRoutes from "./routes/user.routes.js";
import equipmentRoutes from "./routes/equipment.routes.js";
import rentalRoutes from "./routes/rental.routes.js";
import evaluationRoutes from "./routes/evaluation.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import { sessionSecret } from "./config/env.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use(
  session({ secret: sessionSecret, resave: false, saveUninitialized: false }),
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleRoutes);
app.use("/api/auth", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/equipments", equipmentRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/favorites", favoriteRoutes);

app.use((req, res) => res.status(404).json({ message: "Not Found" }));
app.use(errorHandler);

export default app;
