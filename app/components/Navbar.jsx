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
    <header className="bg-main sticky top-0 z-[50] flex h-[8%] w-full items-center justify-end px-6 shadow-md">
      {/* NAVIGATION LINKS */}
      <nav className="flex gap-6">
        <button
          className="cursor-pointer rounded-lg px-4 py-2 font-sans text-xl transition"
          onClick={() => handleNavigation(homeRef, "/")}
        >
          HOME
        </button>
        <button
          className="cursor-pointer rounded-lg px-4 py-2 font-sans text-xl transition"
          onClick={() => handleNavigation(aboutRef, "/")}
        >
          ABOUT
        </button>
        <button
          className="cursor-pointer rounded-lg px-4 py-2 font-sans text-xl transition"
          onClick={() => handleNavigation(contactRef, "/")}
        >
          CONTACT
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
