import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createPaymentOrder,
  getAllPurchasedCourse,
  getCourseDetailWithPurchaseStatus,
  razorpayWebhook,
} from "../controllers/coursePurchase.controller.js";

const router = express.Router();

// Route to create payment order with Razorpay
router.route("/checkout/create-payment-order").post(isAuthenticated, createPaymentOrder);

// Webhook to handle Razorpay payment status updates
router.route("/webhook").post(express.raw({ type: "application/json" }), razorpayWebhook);

// Route to get course details with purchase status
router.route("/course/:courseId/detail-with-status").get(isAuthenticated, getCourseDetailWithPurchaseStatus);

// Route to get all purchased courses for a user
router.route("/").get(isAuthenticated, getAllPurchasedCourse);

export default router;
