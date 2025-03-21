"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const Navbar = ({ scrollToSection, homeRef, aboutRef, contactRef }) => {
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const storedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(storedMode);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

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
    <header
      className={`z-[50] h-[8%] w-full justify-end flex items-center px-6 sticky top-0 shadow-md opacity-95 
  ${darkMode ? "bg-gray-900 text-white" : "bg-[#F8F9FA] text-black"}`}
    >
      {/* NAVIGATION LINKS */}
      <nav className="flex gap-6">
        <button
          className="font-sans px-4 py-2 rounded-lg transition text-xl dark:text-main cursor-pointer"
          onClick={() => handleNavigation(homeRef, "/")}
        >
          HOME
        </button>
        <button
          className="font-sans px-4 py-2 rounded-lg transition text-xl dark:text-main cursor-pointer"
          onClick={() => handleNavigation(aboutRef, "/")}
        >
          ABOUT
        </button>
        <button
          className="font-sans px-4 py-2 rounded-lg transition text-xl cursor-pointer dark:text-main"
          onClick={() => handleNavigation(contactRef, "/")}
        >
          CONTACT
        </button>

        <button
          onClick={toggleDarkMode}
          className="h-16 w-16 dark:text-main text-xl font-sans"
        >
          {darkMode ? "LIGHT" : "DARK"}
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
