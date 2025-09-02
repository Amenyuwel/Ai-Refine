/**
 * Global Toast Provider Component
 * This component provides a centralized toast configuration for the entire application
 * to prevent conflicts from multiple ToastContainer instances
 */

"use client";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={false}
        pauseOnHover={false}
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </>
  );
};

export default ToastProvider;
