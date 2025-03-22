"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
    <header className="z-[50] h-[8%] w-full justify-end flex items-center px-6 sticky top-0 shadow-md bg-main">
      {/* NAVIGATION LINKS */}
      <nav className="flex gap-6">
        <button
          className="font-sans px-4 py-2 rounded-lg transition text-xl cursor-pointer"
          onClick={() => handleNavigation(homeRef, "/")}
        >
          HOME
        </button>
        <button
          className="font-sans px-4 py-2 rounded-lg transition text-xl cursor-pointer"
          onClick={() => handleNavigation(aboutRef, "/")}
        >
          ABOUT
        </button>
        <button
          className="font-sans px-4 py-2 rounded-lg transition text-xl cursor-pointer"
          onClick={() => handleNavigation(contactRef, "/")}
        >
          CONTACT
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
