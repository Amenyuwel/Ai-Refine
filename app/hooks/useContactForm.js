"use client";

import { useState } from "react";
import pb from "@/utils/pocketbase";

// The SDK reports an unreachable server as status 0 with a generic message,
// and puts per-field validation errors in response.data.
const describeSubmitError = (error) => {
  if (error.status === 0 && !error.isAbort) {
    return "Could not reach the server. Please try again later.";
  }
  const fieldErrors = Object.entries(error.response?.data ?? {}).map(
    ([field, detail]) => `${field}: ${detail.message}`,
  );
  return [error.message, ...fieldErrors].join("\n");
};

const useContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await pb.collection("contact_messages").create({ name, email, message });

      setName("");
      setEmail("");
      setMessage("");
      alert("Message submitted successfully!");
    } catch (error) {
      console.error("Error submitting message: ", error);
      alert(`Error submitting message: ${describeSubmitError(error)}`);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    message,
    setMessage,
    handleSubmit,
  };
};

export default useContactForm;
