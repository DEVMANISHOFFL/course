import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const BuyCourseButton = ({ courseId }) => {
  const [createCheckoutSession, { data, isLoading, isSuccess, isError, error }] =
    useCreateCheckoutSessionMutation();

  const purchaseCourseHandler = async () => {
    await createCheckoutSession(courseId);
  };

  useEffect(() => {
    if (isSuccess) {
      if (data?.orderId && data?.amount && data?.currency && data?.key) {
        const options = {
          key: data.key, // Your Razorpay key ID
          amount: data.amount, // Amount in paise
          currency: data.currency,
          name: "Course Purchase", // You can use the course name here
          description: "Course Purchase Description", // Customize this as needed
          image: "https://example.com/logo.png", // Add logo URL if available
          order_id: data.orderId, // Order ID received from the server
          handler: function (response) {
            // Handle payment success
            console.log("Payment successful:", response);
            toast.success("Payment successful");
            // Here, you can send payment info to your backend for validation and order update
          },
          prefill: {
            name: "User Name", // Prefill with logged-in user data
            email: "user@example.com",
            contact: "+919876543210", // User's contact number
          },
          theme: {
            color: "#F37254", // Customize the color of the Razorpay button
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      } else {
        toast.error("Invalid response from server.");
      }
    }

    if (isError) {
      toast.error(error?.data?.message || "Failed to create checkout session");
    }
  }, [data, isSuccess, isError, error]);

  return (
    <Button
      disabled={isLoading}
      onClick={purchaseCourseHandler}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        "Purchase Course"
      )}
    </Button>
  );
};

export default BuyCourseButton;
