import React from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion

// Define FloatingShape directly here or import it if it's in a shared location
// Assuming it's defined elsewhere and imported:
// import { FloatingShape } from './FloatingShape'; // Adjust the import path as needed

// --- OR Define FloatingShape here if not importing ---
interface FloatingShapeProps {
  initialX: string | number;
  initialY: string | number;
  delay: number;
  duration: number;
  size: string | number;
  colorFrom: string;
  colorTo: string;
}

function FloatingShape({ initialX, initialY, delay, duration, size, colorFrom, colorTo }: FloatingShapeProps) {
  return (
    <motion.div
      className={`absolute rounded-full opacity-30 mix-blend-multiply filter blur-3xl -z-10 bg-gradient-to-br ${colorFrom} ${colorTo}`}
      style={{ width: size, height: size }}
      initial={{ x: initialX, y: initialY, scale: 0.8, opacity: 0 }}
      animate={{
        x: [initialX, `${parseFloat(initialX as string)}${initialX.toString().includes('vw') ? 'vw' : 'px'} + 50px`, `${parseFloat(initialX as string)}${initialX.toString().includes('vw') ? 'vw' : 'px'} - 30px`, initialX] as unknown,
        y: [initialY, `${parseFloat(initialY as string)}${initialY.toString().includes('vh') ? 'vh' : 'px'} - 40px`, `${parseFloat(initialY as string)}${initialY.toString().includes('vh') ? 'vh' : 'px'} + 60px`, initialY] as unknown,
        rotate: [0, 90, -60, 0],
        scale: [0.8, 1.1, 0.9, 1],
        opacity: [0, 0.3, 0.4, 0.3],
      }}
      transition={{
        duration: duration,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror",
        delay: delay,
      }}
    />
  );
}
// --- End FloatingShape Definition ---


interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-cyan-50 via-white to-purple-50 text-gray-800 overflow-hidden relative">

      {/* Dynamic Background Shapes */}
      <FloatingShape initialX="-15vw" initialY="10vh" delay={0.5} duration={17} size="380px" colorFrom="from-cyan-200" colorTo="to-blue-200" />
      <FloatingShape initialX="75vw" initialY="5vh" delay={1.5} duration={20} size="320px" colorFrom="from-purple-200" colorTo="to-pink-200" />
      <FloatingShape initialX="10vw" initialY="75vh" delay={0} duration={18} size="250px" colorFrom="from-teal-200" colorTo="to-green-200" />
      {/* Add more or adjust parameters as needed */}

      {/* Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Simplified Navigation for Auth pages */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center sm:justify-start h-16 md:h-18"> {/* Centered on mobile, left on sm+ */}
              <Link to="/" className="flex items-center space-x-2 group">
                <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:opacity-80 transition-opacity" />
                <span className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 group-hover:opacity-80 transition-opacity">
                  AetherMail
                </span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Auth Content Area */}
        {/* flex-grow pushes content down if footer exists, centers vertically otherwise */}
        <main className="flex-grow flex items-center justify-center py-12 px-4">
            {/* max-w-md keeps the form contained, w-full makes it responsive */}
             <div className="w-full max-w-md">
                 {children}
            </div>
        </main>

        {/* Optional Minimal Footer for Auth Pages */}
         {/*
        <footer className="text-center py-6 mt-auto border-t border-gray-200/50 text-xs text-gray-500">
           © {new Date().getFullYear()} AetherMail. Secure Sign In.
         </footer>
        */}

      </div>
    </div>
  );
}