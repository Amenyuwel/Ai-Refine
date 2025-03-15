"use client";
import toast, { Toaster } from "react-hot-toast";

// Custom Toast Function
export const showToast = (message, type = "default") => {
  const isError = type === "error";

  toast(message, {
    position: "bottom-right",
    duration: 4000,
    style: {
      background: isError ? "#D9534F" : "#333",
      color: "#fff",
      borderRadius: "10px",
      padding: "12px",
      fontSize: "14px",
    },
    icon: isError ? "❌" : "✅",
  });
};

// Global Toast Component
const Toast = () => <Toaster position="bottom-right" reverseOrder={false} />;

export default Toast;
