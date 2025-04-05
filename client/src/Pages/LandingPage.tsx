import { useState, useEffect, useRef, SetStateAction } from 'react';
import { Mail, Star, Clock, Send, FileEdit, Search, ChevronRight, Sparkles, Shield, Zap, Settings, CheckCircle2, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';

// Custom hook for viewport animation triggering
function useAnimateInView(threshold = 0.1) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  return [ref, isInView];
}

// Floating shapes component for background
interface FloatingShapeProps {
  initialX: string | number; 
  initialY: string | number; 
  delay: number;
  duration: number;
  size: string | number; 
  colorFrom: string; 
  colorTo: string;   
}

// Floating shapes component for background
function FloatingShape({
  initialX,
  initialY,
  delay,
  duration,
  size,
  colorFrom,
  colorTo
}: FloatingShapeProps) { // Apply the interface here
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

function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();

  // Parallax and header effects
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const yHero = useTransform(scrollYProgress, [0, 0.2], ['0%', '-20%']);
  const headerShadow = useTransform(scrollYProgress, [0, 0.05], ['0px 0px 0px rgba(0,0,0,0)', '0px 4px 15px rgba(0, 0, 0, 0.05)']);
  const headerBgOpacity = useTransform(scrollYProgress, [0, 0.05], [0.8, 1]); // Start slightly transparent

  // Refs for in-view animations
  const [statsRef, statsInView] = useAnimateInView(0.3);
  const [featuresRef, featuresInView] = useAnimateInView(0.1);
  const [waitlistRef, waitlistInView] = useAnimateInView(0.4);
  const [footerRef, footerInView] = useAnimateInView(0.5);

  useEffect(() => {
    // Lock scroll when mobile menu is open
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; } // Cleanup on unmount
  }, [isMobileMenuOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
        setSubmitted(true);
        setEmail('');
        setTimeout(() => setSubmitted(false), 5000); // Hide message after 5s
    }, 500);
  };

  const handleGetStartedClick = () => {
    navigate('/content'); // Navigate to signup page
  };

  const handleWatchDemoClick = () => {
    window.open("https://www.loom.com/share/34f7cad2331840058c5ae9b4cddbf28b?sid=a8f525d3-8e4b-47ec-9a7b-896bad5e9efa", "_blank");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.15 * i, delayChildren: 0.04 * i },
    }),
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] } // More expressive ease
    }
  };

  const featureCardVariants = {
    hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
  ];

  const features = [
    { icon: Sparkles, title: 'AI Summarization', description: 'Crystal-clear summaries of long emails instantly.' },
    { icon: Send, title: 'Smart Compose', description: 'AI crafts replies that sound just like you, only faster.' },
    { icon: Search, title: 'Cognitive Search', description: 'Find anything, anytime, understanding context, not just keywords.' },
    { icon: Star, title: 'Priority Flow', description: 'Automatically surfaces what needs your attention now.' },
    { icon: Clock, title: 'Predictive Scheduling', description: 'Suggests the perfect time to send emails for max impact.' },
    { icon: FileEdit, title: 'Tone Analysis', description: 'Ensure your message lands perfectly with AI tone suggestions.' },
    { icon: Shield, title: 'Quantum Security', description: 'Next-gen encryption protecting your communications.' },
    { icon: Zap, title: 'Hyper Processing', description: 'Experience truly instant email handling and sorting.' },
    { icon: Settings, title: 'Adaptive Workflows', description: 'Your email learns and automates based on your unique habits.' },
  ];

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-cyan-50 via-white to-purple-50 text-gray-800 overflow-x-hidden relative">
      {/* Background Floating Shapes */}
      <FloatingShape initialX="-10vw" initialY="20vh" delay={0} duration={15} size="400px" colorFrom="from-cyan-200" colorTo="to-blue-200" />
      <FloatingShape initialX="70vw" initialY="10vh" delay={2} duration={18} size="350px" colorFrom="from-purple-200" colorTo="to-pink-200" />
      <FloatingShape initialX="20vw" initialY="70vh" delay={4} duration={20} size="300px" colorFrom="from-teal-200" colorTo="to-green-200" />
      <FloatingShape initialX="80vw" initialY="60vh" delay={1} duration={16} size="250px" colorFrom="from-yellow-100" colorTo="to-orange-200" />

      {/* Content Area */}
      <div className="relative z-10">
        {/* Header */}
        <motion.nav
          style={{
            boxShadow: headerShadow,
            backgroundColor: `rgba(255, 255, 255, ${headerBgOpacity})` // Use transformed opacity
          }}
          className="sticky top-0 z-50 backdrop-blur-lg border-b border-gray-200/50 transition-shadow duration-300"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              <motion.div
                className="flex items-center space-x-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
              >
                 <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500" />
                <span className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">
                  AetherMail
                </span>
              </motion.div>
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center space-x-8">
                {navLinks.map((item) => (
                  <motion.a
                    key={item.name}
                    whileHover={{ scale: 1.1, color: '#0891b2' }} // Cyan hover
                    whileTap={{ scale: 0.95 }}
                    href={item.href}
                    className="text-gray-600 hover:text-cyan-700 transition-colors font-medium"
                  >
                    {item.name}
                  </motion.a>
                ))}
                 <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0px 5px 15px rgba(100, 116, 139, 0.2)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/login')}
                  className="text-gray-600 font-medium px-5 py-2 rounded-full hover:text-cyan-700 transition-all"
                >
                  Log In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, y: -1, boxShadow: "0 10px 20px -5px rgba(14, 165, 233, 0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2.5 rounded-full font-semibold flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span>Sign Up</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="md:hidden p-2 text-gray-600 hover:text-cyan-700"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                <Menu className="w-7 h-7" />
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed inset-0 bg-white/95 backdrop-blur-xl z-50 md:hidden p-6 flex flex-col"
              >
                  <div className="flex justify-between items-center mb-10">
                     <div className="flex items-center space-x-2">
                        <Mail className="w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500" />
                        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">
                            AetherMail
                        </span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9, rotate: -90 }}
                      className="p-2 text-gray-600 hover:text-cyan-700"
                      onClick={toggleMobileMenu}
                      aria-label="Close menu"
                    >
                      <X className="w-7 h-7" />
                    </motion.button>
                  </div>

                  <nav className="flex flex-col space-y-6 mb-auto">
                      {navLinks.map((item) => (
                          <motion.a
                              key={item.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + navLinks.indexOf(item) * 0.05 }}
                              href={item.href}
                              onClick={toggleMobileMenu}
                              className="text-2xl text-gray-700 hover:text-cyan-700 transition-colors font-medium py-2"
                          >
                              {item.name}
                          </motion.a>
                      ))}
                  </nav>

                   <div className="flex flex-col space-y-4 mt-8">
                       <motion.button
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => { navigate('/login'); toggleMobileMenu(); }}
                            className="w-full text-center py-3 px-6 border border-cyan-500 text-cyan-600 rounded-full font-semibold transition-all hover:bg-cyan-50"
                        >
                            Log In
                        </motion.button>
                        <motion.button
                             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.03, y: -1, boxShadow: "0 8px 15px -3px rgba(14, 165, 233, 0.3)" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { navigate('/signup'); toggleMobileMenu(); }}
                            className="w-full text-center bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 px-6 rounded-full font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                            Sign Up
                        </motion.button>
                    </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.nav>

        {/* Hero Section */}
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ y: yHero, scale: scaleHero, opacity: opacityHero }}
        >
            <motion.h1
              variants={childVariants}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
            >
              <span className="block xl:inline">Your Inbox,</span>{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 xl:inline">
                Intelligently Reimagined.
              </span>
            </motion.h1>
            <motion.p
              variants={childVariants}
              className="text-lg sm:text-xl text-gray-600 max-w-xl md:max-w-2xl mx-auto mb-10"
            >
              AetherMail uses cutting-edge AI to streamline your email, automate tasks, and give you back your focus. Experience effortless communication.
            </motion.p>
            <motion.div
              variants={childVariants}
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2, boxShadow: "0 12px 25px -8px rgba(14, 165, 233, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 duration-300 ease-out"
                onClick={handleGetStartedClick}
              >
                Get Started Free
              </motion.button>
              <motion.button
                 whileHover={{ scale: 1.05, y: -2, boxShadow: "0 8px 20px -8px rgba(107, 114, 128, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-gray-700 px-8 py-3 rounded-full font-semibold text-lg border border-gray-300 shadow-md hover:shadow-lg hover:border-gray-400 transition-all transform hover:-translate-y-0.5 duration-300 ease-out"
                onClick={handleWatchDemoClick}
              >
                Watch Demo
              </motion.button>
            </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
          variants={containerVariants}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
        >
           <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { number: '70%', label: 'Time Saved Weekly' },
              { number: '99.8%', label: 'Response Accuracy' },
              { number: '10k+', label: 'Early Adopters' },
            ].map((stat, index) => (
              <motion.div key={index} variants={childVariants}>
                 <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>


        {/* Features Section */}
         <motion.div
            id="features"
            ref={featuresRef}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28"
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
        >
             <motion.h2
                variants={childVariants}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6"
             >
                Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600">Superpowers</span> for Your Inbox
            </motion.h2>
            <motion.p
                variants={childVariants}
                className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-16 sm:mb-20"
             >
                Go beyond basic email. AetherMail transforms your workflow with intelligent features designed for modern communication.
            </motion.p>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={featureCardVariants}
                whileHover={{
                    scale: 1.04,
                    y: -5,
                    boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.08)",
                    borderColor: 'rgba(14, 165, 233, 0.5)' // Cyan border on hover
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent cursor-pointer group" // Subtle white, blurred
              >
                 <motion.div
                  // Gentle rotate on hover for icon background
                  whileHover={{ rotate: 15 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 bg-gradient-to-br ${index % 3 === 0 ? 'from-cyan-100 to-blue-100' : index % 3 === 1 ? 'from-purple-100 to-pink-100' : 'from-teal-100 to-green-100' } transition-colors group-hover:from-cyan-200 group-hover:to-purple-200`}
                >
                  <feature.icon className={`w-6 h-6 ${index % 3 === 0 ? 'text-cyan-600' : index % 3 === 1 ? 'text-purple-600' : 'text-teal-600' } transition-colors group-hover:text-cyan-700`} />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

         {/* Call to Action / Waitlist Section */}
        <motion.div
          ref={waitlistRef}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 py-20 sm:py-28 my-20 sm:my-32 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate={waitlistInView ? "visible" : "hidden"}
        >
            {/* Subtle background pattern */}
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>

            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                <motion.h2 variants={childVariants} className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Experience the Future of Email?</motion.h2>
                <motion.p variants={childVariants} className="text-lg sm:text-xl text-purple-100 mb-10">
                Join our waitlist for exclusive early access, special offers, and updates as we launch AetherMail.
                </motion.p>
                <motion.form
                    variants={childVariants}
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row items-center justify-center max-w-lg mx-auto space-y-4 sm:space-y-0 sm:space-x-3"
                >
                <motion.input
                    whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(255, 255, 255, 0.5)" }}
                    type="email"
                    value={email}
                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-6 py-3 rounded-full bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/80 transition duration-300 shadow-sm"
                    required
                    aria-label="Email address for waitlist"
                />
                <motion.button
                    whileHover={{ scale: 1.05, y: -1, boxShadow: "0 8px 15px rgba(0, 0, 0, 0.15)" }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 transition-colors text-purple-600 px-8 py-3 rounded-full font-semibold text-lg shadow-md"
                >
                    Join Waitlist
                </motion.button>
                </motion.form>
                <AnimatePresence>
                {submitted && (
                    <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-5 text-white flex items-center justify-center space-x-2 font-medium"
                    >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Thanks for joining! We'll email you soon.</span>
                    </motion.div>
                )}
                </AnimatePresence>
          </div>
        </motion.div>

         {/* Footer */}
        <motion.footer
          ref={footerRef}
          className="border-t border-gray-200/60 mt-24 sm:mt-32"
          variants={containerVariants}
          initial="hidden"
          animate={footerInView ? "visible" : "hidden"}
        >
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
             <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
               <motion.div variants={childVariants} className="flex items-center space-x-2">
                   <Mail className="w-6 h-6 text-cyan-600" />
                   <span className="text-xl font-semibold text-gray-700">AetherMail</span>
                </motion.div>
                 <motion.div variants={childVariants} className="text-sm text-gray-500">
                   © {new Date().getFullYear()} AetherMail. All rights reserved.
                 </motion.div>
                <motion.div variants={childVariants} className="flex space-x-6">
                   <a href="/privacy" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">Privacy Policy</a>
                    <a href="/terms" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">Terms of Service</a>
                 </motion.div>
              </div>
           </div>
         </motion.footer>
      </div>
    </div>
  );
}

export default LandingPage;