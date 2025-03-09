"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";

const Navbar = ({ scrollToSection, homeRef, aboutRef, contactRef }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (sectionRef, route) => {
    if (pathname === "/") {
      // If already on the home page and scrollToSection exists, scroll
      if (scrollToSection) {
        scrollToSection(sectionRef);
      }
    } else {
      // Navigate to home first, then scroll after the page loads
      router.push(route);
      setTimeout(() => {
        if (scrollToSection) scrollToSection(sectionRef);
      }, 500); // Delay to ensure page loads
    }
  };

  return (
    <header className="z-50 h-[8%] w-full bg-[#F8F9FA]  flex items-center justify-between px-6 sticky top-0 shadow-md opacity-95">
      {/* LOGO & BRAND NAME - Both Clickable */}
      <div className="flex items-center gap-3">
      <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      handleNavigation(homeRef, "/");
    }}
    className="inline-flex items-center gap-2 cursor-pointer px-2 py-1  rounded-md"
  >
    <img src="/images/logo.svg" alt="Logo" className="h-10 w-auto" />
    <span className="pl-2 text-5xl font-bold text-main">AI-REFINE</span>
  </a>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex gap-6">
        <button className="font-sans px-4 py-2 rounded-lg transition text-xl text-main cursor-pointer"
          onClick={() => handleNavigation(homeRef, "/")}>
          HOME
        </button>
        <button className="font-sans px-4 py-2 rounded-lg transition text-xl text-main cursor-pointer"
          onClick={() => handleNavigation(aboutRef, "/")}>
          ABOUT
        </button>
        <button className="font-sans px-4 py-2 rounded-lg transition text-xl text-main cursor-pointer"
          onClick={() => handleNavigation(contactRef, "/")}>
          CONTACT
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
