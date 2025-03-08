import React from "react";
// #F8F9FA NAVBAR COLOR
const Navbar = () => {
  return (
    <div className="z-50 h-[8%] w-full bg-[#F8F9FA] text-black flex items-center justify-between px-6 sticky top-0 shadow-md">
      {/* LOGO & BRAND NAME */}
      <div className="flex items-center gap-3">
        <img src="/images/logo.svg" alt="Logo" className="h-full w-[10%]" />
        <h1 className="text-4xl font-bold text-main">AI-REFINE</h1>
      </div>

      {/* NAVIGATION LINKS */}
      <div className="flex gap-6">
        <button className="font-sans px-4 py-2 rounded-lg transition text-xl text-main">
          HOME
        </button>
        <button className="font-sans px-4 py-2 rounded-lg transition text-xl text-main">
          ABOUT
        </button>
        <button className="font-sans px-4 py-2 rounded-lg transition text-xl text-main">
          CONTACT
        </button>
      </div>
    </div>
  );
};

export default Navbar;
