import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";

dotenv.config();

// Database connection
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Update CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        if (origin === "http://localhost:5173" || origin?.endsWith("ngrok-free.app")) {
            callback(null, true);
        } else {
            callback(new Error("CORS not allowed"), false);
        }
    },
    credentials: true,  // Allow credentials
}));


// Middlewares
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});
