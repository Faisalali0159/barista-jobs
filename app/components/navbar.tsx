"use client";

import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <a href="#" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Barista Job's Logo"
              width={48}
              height={48}
              className="w-10 h-10 sm:w-12 sm:h-12"
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-navy leading-tight">
                BARISTA JOB&apos;S
              </span>
              <span className="text-[10px] sm:text-xs text-orange font-medium leading-tight">
                Great Barista, Better Business
              </span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#services"
              className="text-sm font-medium text-gray-600 hover:text-navy transition-colors"
            >
              Services
            </a>
            <a
              href="#job-seekers"
              className="text-sm font-medium text-gray-600 hover:text-navy transition-colors"
            >
              Find a Job
            </a>
            <a
              href="#employers"
              className="text-sm font-medium text-gray-600 hover:text-navy transition-colors"
            >
              Hire Staff
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-gray-600 hover:text-navy transition-colors"
            >
              Contact
            </a>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-navy"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-3">
            <a
              href="#services"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-600 hover:text-navy"
            >
              Services
            </a>
            <a
              href="#job-seekers"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-600 hover:text-navy"
            >
              Find a Job
            </a>
            <a
              href="#employers"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-600 hover:text-navy"
            >
              Hire Staff
            </a>
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-600 hover:text-navy"
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
