import React from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
      style={{ width: size, height: size, left: initialX, top: initialY }}
      animate={{
        x: ['0%', '10%', '-5%', '0%'],
        y: ['0%', '-8%', '12%', '0%'],
        rotate: [0, 90, -60, 0],
        scale: [0.8, 1.1, 0.9, 1],
        opacity: [0.3, 0.4, 0.35, 0.3],
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

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white overflow-hidden relative">
      <FloatingShape initialX="-15vw" initialY="10vh" delay={0.5} duration={17} size="380px" colorFrom="from-purple-600" colorTo="to-purple-800" />
      <FloatingShape initialX="75vw" initialY="5vh" delay={1.5} duration={20} size="320px" colorFrom="from-purple-500" colorTo="to-purple-700" />
      <FloatingShape initialX="10vw" initialY="75vh" delay={0} duration={18} size="250px" colorFrom="from-purple-400" colorTo="to-purple-600" />

      <div className="relative z-10 flex flex-col min-h-screen">

        <nav className="border-b border-purple-800/30 backdrop-blur-sm sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center sm:justify-start h-16 md:h-18">
              <Link to="/" className="flex items-center space-x-2 group">
                <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400 group-hover:opacity-80 transition-opacity" />
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                  AutoMailX
                </span>
              </Link>
            </div>
          </div>
        </nav>


        <main className="flex-grow flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}