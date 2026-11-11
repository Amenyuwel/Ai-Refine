"use client";
import React, { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

// offsetTop ignores the parallax translateY that getBoundingClientRect includes,
// which made the landing position drift by the parallax offset.
const scrollToSection = (sectionRef, offset = 0) => {
  if (!sectionRef?.current) return;
  window.scrollTo({
    top: Math.max(0, sectionRef.current.offsetTop - offset),
    behavior: "smooth",
  });
};

const NAV_ID = "main-navigation";

const Navbar = ({ homeRef, aboutRef, contactRef }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigation = useCallback(
    (sectionRef, route, sectionName = null) => {
      setMenuOpen(false); // Close menu on navigation
      const navbarHeight = document.querySelector("header")?.offsetHeight ?? 0;

      if (pathname === "/") {
        // If already on the home page and scrollToSection exists, scroll with an offset
        if (scrollToSection && sectionRef) {
          scrollToSection(sectionRef, navbarHeight); // Pass the navbar height as the offset
        }
      } else {
        // Navigate to home first, then scroll after the page loads
        if (sectionName) {
          // Use hash routing for sections
          router.push(`/${sectionName ? `#${sectionName}` : ''}`);
        } else {
          router.push(route);
        }
        
        // If we have a section reference, scroll to it after navigation
        setTimeout(() => {
          if (scrollToSection && sectionRef) {
            scrollToSection(sectionRef, navbarHeight); // Add offset after navigation
          }
        }, 100); // Add a small delay to ensure navigation happens first
      }
    },
    [pathname, router],
  );

  return (
    <>
    <header className="bg-main sticky top-0 z-[50] flex w-full items-center justify-between p-4 shadow-md">
      {/* NAVIGATION LINKS */}
      <Link
        href="/#home"
        className="px-4 text-2xl font-bold sm:px-8 sm:text-4xl"
        onClick={(event) => {
          event.preventDefault();
          handleNavigation(homeRef, "/", "home");
        }}
      >
        ai-refine
      </Link>

      {/* Hamburger Icon */}
      <button
        className="flex h-10 w-10 flex-col items-center justify-center sm:hidden"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        aria-controls={NAV_ID}
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
        id={NAV_ID}
        aria-label="Main"
        className={` ${menuOpen ? "flex" : "hidden"} bg-main absolute top-full left-0 w-full flex-col items-center gap-4 p-4 sm:static sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-6 sm:p-0`}
      >
        <Link
          href="/#home"
          className="cursor-pointer rounded-lg px-4 py-2 font-sans text-xl transition"
          onClick={(event) => {
            event.preventDefault();
            handleNavigation(homeRef, "/", "home");
          }}
        >
          HOME
        </Link>
        <Link
          href="/#about"
          className="cursor-pointer rounded-lg px-4 py-2 font-sans text-xl transition"
          onClick={(event) => {
            event.preventDefault();
            handleNavigation(aboutRef, "/", "about");
          }}
        >
          ABOUT
        </Link>
        <Link
          href="/#contact"
          className="cursor-pointer rounded-lg px-4 py-2 font-sans text-xl transition"
          onClick={(event) => {
            event.preventDefault();
            handleNavigation(contactRef, "/", "contact");
          }}
        >
          CONTACT
        </Link>
      </nav>
    </header>
    {/* Skip link target: after the header because some pages render Navbar inside <main> */}
    <div id="main-content" tabIndex={-1} className="outline-none" />
    </>
  );
};

export default Navbar;
