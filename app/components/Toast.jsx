"use client";
import toast, { Toaster } from "react-hot-toast";

// Predefined Toast Messages
const toastMessages = {
  noImage: {
    message:
      "Invalid image uploaded, please upload an image in PNG or JPG format.",
    type: "error",
  },
  invalidImage: { message: "Please upload a valid image file!", type: "error" },
  success: { message: "Image uploaded successfully!", type: "success" },
};

// Custom Toast Function
export const showToast = (type) => {
  const toastData = toastMessages[type] || {
    message: "Something went wrong!",
    type: "error",
  };
  const isError = toastData.type === "error";

  toast(toastData.message, {
    position: "bottom-center",
    duration: 4000,
    style: {
      background: isError ? "#D9534F" : "#4CAF50", // Red for error, Green for success
      color: "#fff",
      borderRadius: "10px",
      padding: "12px",
      fontSize: "14px",
      marginBottom: "30px",
    },
    icon: isError ? "❌" : "✅",
  });
};

// Global Toast Component
const Toast = () => <Toaster position="bottom-center" reverseOrder={false} />;

export default Toast;
