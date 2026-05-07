"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from "wouter";
import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <a href={href} className="group relative inline-block overflow-hidden h-5 flex items-center text-sm">
      <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
        <span className="text-gray-300">{children}</span>
        <span className="text-white">{children}</span>
      </div>
    </a>
  );
};

export default function Navbar() {
  const { isSignedIn, user, signOut } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isInSession = location?.startsWith('/session/');

  useEffect(() => {
    if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current);
    if (isOpen) {
      setHeaderShapeClass('rounded-xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => setHeaderShapeClass('rounded-full'), 300);
    }
    return () => { if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current); };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const logoElement = (
    <a href="/" className="relative w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity">
      <img src="/brand-assets/vibra-logo.png" alt="Vibra Logo" className="w-full h-full object-contain" />
    </a>
  );

  const navLinksData = [
    { label: 'Home', href: '/' },
    { label: 'Sessions', href: '/sessions' },
    { label: 'Billing', href: '/billing' },
  ];

  const publicNavLinksData = [
    { label: 'Pricing', href: '/billing' },
    { label: 'Contact', href: '/contact' },
  ];

  const sampleTestimonials: Testimonial[] = [
    { avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg", name: "Sarah Chen", handle: "@sarahdigital", text: "Amazing platform! The user experience is seamless and the features are exactly what I needed." },
    { avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg", name: "Marcus Johnson", handle: "@marcustech", text: "This service has transformed how I work. Clean design, powerful features, and excellent support." },
    { avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg", name: "David Martinez", handle: "@davidcreates", text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for productivity." },
  ];

  const loginButtonElement = (
    <button onClick={() => setIsSignInOpen(true)} className="px-4 py-2 sm:px-3 text-xs sm:text-sm border border-[#333] bg-[rgba(31,31,31,0.62)] text-gray-300 rounded-full hover:border-white/50 hover:text-white transition-colors duration-200 w-full sm:w-auto">
      LogIn
    </button>
  );

  const signupButtonElement = (
    <div className="relative group w-full sm:w-auto">
      <div className="absolute inset-0 -m-2 rounded-full hidden sm:block bg-gray-100 opacity-40 filter blur-lg pointer-events-none transition-all duration-300 ease-out group-hover:opacity-60 group-hover:blur-xl group-hover:-m-3" />
      <button onClick={() => setIsSignInOpen(true)} className="relative z-10 px-4 py-2 sm:px-3 text-xs sm:text-sm font-semibold text-black bg-gradient-to-br from-gray-100 to-gray-300 rounded-full hover:from-gray-200 hover:to-gray-400 transition-all duration-200 w-full sm:w-auto">
        Signup
      </button>
    </div>
  );

  return (
    <>
      <header className={`fixed ${isInSession ? 'top-2' : 'top-6'} left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center pl-6 pr-6 py-3 backdrop-blur-sm ${isInSession ? 'rounded-lg' : headerShapeClass} border border-[#333] bg-[#1f1f1f57] ${isInSession ? 'w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)]' : 'w-[calc(100%-2rem)] sm:w-auto'} transition-[border-radius] duration-0 ease-in-out`}>
        <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8">
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <button onClick={signOut} className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </button>
                {isInSession && (
                  <a href="/" className="text-sm text-gray-300 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10">
                    ← Home
                  </a>
                )}
              </>
            ) : (
              logoElement
            )}
          </div>

          {!isInSession && (
            <nav className="hidden sm:flex items-center space-x-4 sm:space-x-6 text-sm">
              {(isSignedIn ? navLinksData : publicNavLinksData).map((link) => (
                <AnimatedNavLink key={link.href} href={link.href}>{link.label}</AnimatedNavLink>
              ))}
            </nav>
          )}

          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            {isSignedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">{user?.name}</span>
              </div>
            ) : (
              <>
                {loginButtonElement}
                {signupButtonElement}
              </>
            )}
          </div>

          <button className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-300 focus:outline-none" onClick={toggleMenu}>
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>

        <div className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
          {!isInSession && (
            <nav className="flex flex-col items-center space-y-4 text-base w-full">
              {(isSignedIn ? navLinksData : publicNavLinksData).map((link) => (
                <a key={link.href} href={link.href} className="text-gray-300 hover:text-white transition-colors w-full text-center">{link.label}</a>
              ))}
            </nav>
          )}
          <div className="flex flex-col items-center space-y-4 mt-4 w-full">
            {isSignedIn ? (
              <span className="text-sm text-gray-300">{user?.name}</span>
            ) : (
              <>
                {loginButtonElement}
                {signupButtonElement}
              </>
            )}
          </div>
        </div>
      </header>

      <SignInPage
        testimonials={sampleTestimonials}
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />
    </>
  );
}
