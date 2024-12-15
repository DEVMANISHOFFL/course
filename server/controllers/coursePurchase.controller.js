import Razorpay from "razorpay";
import crypto from "crypto";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order and Payment Link
export const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    // Create a new course purchase record
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
    });

    // Create Razorpay order
    const options = {
      amount: course.coursePrice * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId,
        userId,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save order ID to the purchase record
    newPurchase.paymentId = order.id;
    await newPurchase.save();

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: options.amount,
      currency: options.currency,
      key: process.env.RAZORPAY_KEY_ID,
      courseName: course.courseTitle,
      courseThumbnail: course.courseThumbnail,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating payment order" });
  }
};

// Razorpay Webhook
export const razorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.WEBHOOK_SECRET;

  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  // Verify webhook signature
  const generatedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (generatedSignature !== signature) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const event = req.body;

  // Handle payment success
  if (event.event === "payment.captured") {
    const { order_id, amount } = event.payload.payment.entity;

    try {
      const purchase = await CoursePurchase.findOne({ paymentId: order_id }).populate({
        path: "courseId",
      });

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      purchase.amount = amount / 100;
      purchase.status = "completed";

      // Make lectures visible
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user's enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } },
        { new: true }
      );

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } },
        { new: true }
      );

      return res.status(200).json({ message: "Payment processed successfully" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  res.status(200).json({ message: "Webhook received" });
};

// Course Details with Purchase Status
export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ userId, courseId });

    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching course details" });
  }
};

// Get All Purchased Courses
export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourses = await CoursePurchase.find({ status: "completed" }).populate(
      "courseId"
    );

    return res.status(200).json({
      purchasedCourses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching purchased courses" });
  }
};
