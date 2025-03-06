import React from "react";
import Navbar from "./components/Navbar";
import AboutPage from "./about/aboutPage";
import ContactPage from "./contact/contactPage";

const page = () => {
  return (
    <div className="overflow:hidden overflow-y-auto h-screen w-full">
        <Navbar />
      <div className="h-screen w-full bg-green-600">HOME</div>
    
      <AboutPage />
      <ContactPage />
    </div>
  );
};

export default page;
