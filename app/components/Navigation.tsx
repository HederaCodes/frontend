"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Train", href: "/train" },
    { name: "Live", href: "/live" },
    { name: "History", href: "/history" },
  ];
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 w-full z-30 transition-all duration-500 ${
        scrolled 
          ? "bg-black/30 backdrop-blur-xl py-3 border-b border-white/10" 
          : "bg-transparent py-3 pb-5"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container-responsive mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative">
                <motion.span
                  className="text-2xl"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -10, 0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                >
                  👻
                </motion.span>
                <motion.div 
                  className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-blue-500"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">Hedera</span>
                  <span className="text-blue-400">Codes</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-blue-300/80 -mt-1">AI Code Replicator</span>
              </div>
            </Link>
          </motion.div>
          
          {/* Desktop navigation */}
          <div className="hidden md:block">
            <ul className="flex items-center space-x-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="relative px-4 py-2">
                    <span className={`relative z-10 font-medium text-sm ${
                      pathname === item.href ? "text-white" : "text-white/60 hover:text-white/90"
                    }`}>
                      {item.name}
                    </span>
                    
                    {pathname === item.href && (
                      <motion.span
                        className="absolute inset-0 rounded-md bg-white/10 border border-white/20"
                        layoutId="navbar-active"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30
                        }}
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Action button */}
          <div className="hidden md:block">
            <Link 
              href="/train" 
              className="btn-primary font-medium text-sm flex items-center gap-2"
            >
              <span>Get Started</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <motion.button
            className="flex md:hidden rounded-md p-2 text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <span className="sr-only">Toggle menu</span>
            <svg 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={1.5}
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
              )}
            </svg>
          </motion.button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden glass-effect border-y border-white/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <div className="px-4 py-3 space-y-1.5">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <Link
                    href={item.href}
                    className={`block py-2.5 px-4 rounded-lg text-base ${
                      pathname === item.href
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "text-white/70 hover:text-white"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.1, duration: 0.3 }}
                exit={{ opacity: 0, x: -10 }}
                className="pt-2 pb-1"
              >
                <Link 
                  href="/train" 
                  className="block w-full py-2.5 text-center bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}