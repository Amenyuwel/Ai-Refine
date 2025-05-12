"use client";
import React, { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// The scrollToSection function (to be used with the Navbar)
const scrollToSection = (sectionRef, offset = 0) => {
  if (sectionRef && sectionRef.current) {
    // Calculate the position of the section relative to the document
    const sectionPosition =
      sectionRef.current.getBoundingClientRect().top + window.scrollY;
    // Scroll to the position with an offset to avoid overlap with the navbar
    window.scrollTo({
      top: sectionPosition - offset, // Subtract the navbar height
      behavior: "smooth", // Smooth scrolling
    });
  }
};

const Navbar = ({ homeRef, aboutRef, contactRef }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigation = useCallback(
    (sectionRef, route) => {
      setMenuOpen(false); // Close menu on navigation
      const navbarHeight = 80; // Set your navbar height here (in px)

      if (pathname === "/") {
        // If already on the home page and scrollToSection exists, scroll with an offset
        if (scrollToSection) {
          scrollToSection(sectionRef, navbarHeight); // Pass the navbar height as the offset
        }
      } else {
        // Navigate to home first, then scroll after the page loads
        router.push(route);
        setTimeout(() => {
          if (scrollToSection) {
            scrollToSection(sectionRef, navbarHeight); // Add offset after navigation
          }
        }, 100); // Add a small delay to ensure navigation happens first
      }
    },
    [pathname, router],
  );

  return (
    <header className="bg-main sticky top-0 z-[50] flex w-full items-center justify-between p-4 shadow-md">
      {/* NAVIGATION LINKS */}
      <h1
        className="cursor-pointer px-4 text-2xl font-bold sm:px-8 sm:text-4xl"
        onClick={() => handleNavigation(homeRef, "/")}
      >
        ai-refine
      </h1>

      {/* Hamburger Icon */}
      <button
        className="flex h-10 w-10 flex-col items-center justify-center sm:hidden"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation"
      >
        <span
          className={`mb-1 block h-1 w-6 bg-[var(--text-main)] transition-all ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
        ></span>
        <span
          className={`mb-1 block h-1 w-6 bg-[var(--text-main)] transition-all ${menuOpen ? "opacity-0" : ""}`}
        ></span>
        <span
          className={`block h-1 w-6 bg-[var(--text-main)] transition-all ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
        ></span>
      </button>

      {/* Navigation Links */}
      <nav
        className={` ${menuOpen ? "flex" : "hidden"} bg-main absolute top-full left-0 w-full flex-col items-center gap-4 p-4 sm:static sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-6 sm:p-0`}
      >
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
