import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../Components/AuthLayout'; // Assuming this provides the themed background/layout
import { motion } from 'framer-motion'; // Import motion
import { Loader2 } from 'lucide-react'; // Using Lucide for loading spinner

// Assuming AuthLayout.tsx looks something like this conceptually:
/*
import { FloatingShape } from './FloatingShape'; // Import if using the same background effect

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-cyan-50 via-white to-purple-50 text-gray-800 overflow-hidden relative flex items-center justify-center p-4">
      {/* Background Floating Shapes - Optional: Move this logic inside if desired *}
      <FloatingShape initialX="-10vw" initialY="20vh" delay={0} duration={15} size="400px" colorFrom="from-cyan-200" colorTo="to-blue-200" />
      <FloatingShape initialX="70vw" initialY="10vh" delay={2} duration={18} size="350px" colorFrom="from-purple-200" colorTo="to-pink-200" />
      { // Add more shapes if needed }
      *
      <main className="relative z-10 w-full max-w-md">
        {children}
      </main>
    </div>
  );
}
*/

const SignUp=()=> {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle Google OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/content');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) { // Basic validation example
        setError('Password must be at least 6 characters long.');
        return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://automailx-sm.onrender.com/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword, // Usually backend only needs 'password'
        }),
      });

      const data = await response.json();

      console.log('Signup attempt for:', formData.email); // Log less sensitive data

      if (!response.ok) {
        // Improve error handling - check for specific messages
        throw new Error(data.message || `Sign-up failed (Status: ${response.status})`);
      }

      // Optional: Show success message briefly before redirecting
      console.log("Signup successful:", data);
      navigate('/login'); // Redirect to login on success

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
       console.error("Signup Error:", err); // Log the actual error
      // Provide user-friendly messages
      if (err.message.includes('already exists')) {
        setError('An account with this email or username already exists.');
      } else if (err.message.includes('failed (Status: 5')) {
        setError('Something went wrong on our end. Please try again later.');
      } else {
        setError(err.message || 'An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (error) setError('');
  };

  const cardVariants = {
      hidden: { opacity: 0, y: 30, scale: 0.95 },
      visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }
      }
  };


  return (
    <AuthLayout>
       <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/70 p-8 md:p-10 w-full" // Updated card style
       >
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
            Join AetherMail
          </span>
        </h2>

        {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-red-600 bg-red-100 border border-red-300 rounded-md text-sm p-3 text-center mb-6"
              role="alert" // Added for accessibility
            >
              {error}
            </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition duration-200 text-gray-800 placeholder-gray-400 shadow-sm"
              placeholder="Choose a unique username"
              disabled={loading}
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email" // Helps with browser autofill
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition duration-200 text-gray-800 placeholder-gray-400 shadow-sm"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password" // Important for password managers
              required
              minLength={6} // HTML5 validation
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition duration-200 text-gray-800 placeholder-gray-400 shadow-sm"
              placeholder="Create a strong password (min. 6 chars)"
              disabled={loading}
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition duration-200 text-gray-800 placeholder-gray-400 shadow-sm"
              placeholder="Re-enter your password"
              disabled={loading}
            />
          </div>

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.03, y: loading ? 0 : -1, filter: loading ? 'none' : 'brightness(1.1)' }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            type="submit"
            className={`w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
          </motion.button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <motion.a
          href="https://automailx-sm.onrender.com/auth/google"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 transition-colors px-8 py-3 rounded-lg font-semibold shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </motion.a>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-cyan-600 hover:text-cyan-800 transition-colors">
            Log In
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}

export default SignUp; // Remove if you export directly like above