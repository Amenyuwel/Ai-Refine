"use client";

import { useState } from "react";
import pb from "@/utils/pocketbase";

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
      alert("Error submitting message: ", error);
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
