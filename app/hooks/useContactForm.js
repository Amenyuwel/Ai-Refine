"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State updates lag a render, so a fast second submit would still see
  // isSubmitting as false; the ref blocks it synchronously.
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await pb.collection("contact_messages").create({ name, email, message });

      setName("");
      setEmail("");
      setMessage("");
      toast.success("Message submitted successfully!");
    } catch (error) {
      console.error("Error submitting message: ", error);
      toast.error(`Error submitting message: ${describeSubmitError(error)}`);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
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
    isSubmitting,
  };
};

export default useContactForm;
