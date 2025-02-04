import React from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-pulse-slow absolute -inset-[10px] opacity-50 bg-gradient-to-br from-purple-600/20 via-transparent to-transparent blur-3xl" />
        <div className="animate-pulse-slower absolute -inset-[10px] opacity-30 bg-gradient-to-tr from-purple-800/20 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-purple-800/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-2">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
                  AutoMailX
                </span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Auth Content */}
        <div className="max-w-md mx-auto px-4 py-12">
          {children}
        </div>
      </div>
    </div>
  );
}