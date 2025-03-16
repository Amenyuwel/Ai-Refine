"use client";
import toast, { Toaster } from "react-hot-toast";

// Predefined Toast Messages
const toastMessages = {
  noImage: "No image uploaded, please upload an image.",
  invalidImage: "Please upload a valid image file!",
};

// Custom Toast Function
export const showToast = (type) => {
  const isError = type === "error";
  const message = toastMessages[type] || "Something went wrong!";

  toast(message, {
    position: "bottom-center",
    duration: 4000,
    style: {
      background: isError ? "#D9534F" : "#333",
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
