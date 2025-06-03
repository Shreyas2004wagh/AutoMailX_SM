import React, { useState } from 'react';
import { Mail, Star, Clock, Send, FileEdit, Search, ChevronRight, Sparkles, Shield, Zap, Settings, CheckCircle2, Github, Twitter, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
   const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
  };
    const handleGetStartedClick = () => {
    navigate('/content');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-pulse-slow absolute -inset-[10px] opacity-50 bg-gradient-to-br from-purple-600/20 via-transparent to-transparent blur-3xl" />
        <div className="animate-pulse-slower absolute -inset-[10px] opacity-30 bg-gradient-to-tr from-purple-800/20 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <nav className="border-b border-purple-800/30 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
                  AutoMailX
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <a onClick={() => navigate('/SignUp')} href="#features" className="text-gray-300 hover:text-white transition-colors">SignUp</a>
                <a onClick={() => navigate('/Login')} href="#features" className="text-gray-300 hover:text-white transition-colors">LogIn</a>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Plans</a>
                <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
                <button className="bg-purple-600 hover:bg-purple-500 transition-colors px-6 py-2 rounded-full font-medium flex items-center space-x-2">
                  <span>Join Waitlist</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button className="md:hidden p-2 text-gray-300 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center space-y-6 sm:space-y-8">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
                AI-Powered Email Management
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Experience the future of email with AI-driven summarization and automated responses.
              Stay organized and efficient with our intelligent email assistant.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4">
              <button className="bg-purple-600 hover:bg-purple-500 transition-colors px-8 py-3 rounded-full font-medium text-lg w-full sm:w-auto" onClick={handleGetStartedClick}>
                Get Started
              </button>
              <button className="border border-purple-600 hover:border-purple-500 transition-colors px-8 py-3 rounded-full font-medium text-lg w-full sm:w-auto">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 sm:mt-20 max-w-4xl mx-auto px-4">
            {[
              { number: '10M+', label: 'Emails Processed' },
              { number: '99.9%', label: 'Accuracy Rate' },
              { number: '5000+', label: 'Happy Users' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-400 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-24 sm:mt-32 px-4">
            {[
              { icon: Sparkles, title: 'AI Summarization', description: 'Get instant summaries of your emails powered by advanced AI' },
              { icon: Send, title: 'Smart Responses', description: 'Automated AI-generated replies for common emails' },
              { icon: Search, title: 'Intelligent Search', description: 'Find any email instantly with our smart search' },
              { icon: Star, title: 'Priority Inbox', description: 'Focus on what matters with AI-powered email prioritization' },
              { icon: Clock, title: 'Smart Scheduling', description: 'Schedule emails and get reminders at the perfect time' },
              { icon: FileEdit, title: 'Draft Assistant', description: 'Get writing suggestions as you compose emails' },
              { icon: Shield, title: 'Advanced Security', description: 'Enterprise-grade security with end-to-end encryption' },
              { icon: Zap, title: 'Lightning Fast', description: 'Optimized performance for instant email processing' },
              { icon: Settings, title: 'Custom Workflows', description: 'Create personalized automation rules for your needs' },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl backdrop-blur-sm border border-purple-800/30 hover:border-purple-600/50 transition-all group hover:transform hover:scale-105"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center mb-4 group-hover:bg-purple-600/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Pricing Section */}
          <div id="pricing" className="mt-24 sm:mt-32 px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16">
              <span className="bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
                Simple, Transparent Plans
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: 'Basic',
                  price: 'Free',
                  description: 'Perfect for personal use',
                  features: ['500 emails/month', 'Basic AI summaries', 'Email templates', '24/7 support'],
                },
                {
                  name: 'Pro',
                  price: 'Contact Us',
                  description: 'For professionals',
                  features: ['Unlimited emails', 'Advanced AI features', 'Custom workflows', 'Priority support'],
                  highlighted: true,
                },
                {
                  name: 'Enterprise',
                  price: 'Custom',
                  description: 'For large teams',
                  features: ['Custom solutions', 'Dedicated support', 'SLA guarantee', 'Custom integrations'],
                },
              ].map((plan, index) => (
                <div
                  key={index}
                  className={`p-6 sm:p-8 rounded-2xl backdrop-blur-sm border transition-all ${
                    plan.highlighted
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-purple-800/30 hover:border-purple-600/50'
                  }`}
                >
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-2xl sm:text-3xl font-bold mb-4">{plan.price}</div>
                  <p className="text-gray-400 mb-6">{plan.description}</p>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 rounded-full font-medium ${
                      plan.highlighted
                        ? 'bg-purple-600 hover:bg-purple-500'
                        : 'border border-purple-600 hover:border-purple-500'
                    } transition-colors`}
                  >
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div id="testimonials" className="mt-24 sm:mt-32 px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16">
              <span className="bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
                What Our Users Say
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Priya Rai',
                  role: 'Marketing Director',
                  content: 'AutoMailX has completely transformed how I handle my emails. The AI summaries are incredibly accurate!',
                  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
                },
                {
                  name: 'Dillin Nair',
                  role: 'Software Engineer',
                  content: 'The automated responses have saved me countless hours. This tool is a game-changer for productivity.',
                  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150',
                },
                {
                  name: 'Swaalina Sharma',
                  role: 'Freelance Writer',
                  content: 'I love how intuitive and powerful AutoMailX is. It helps me stay on top of my inbox effortlessly.',
                  image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150',
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl backdrop-blur-sm border border-purple-800/30 hover:border-purple-600/50 transition-all"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-300">{testimonial.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Waitlist Section */}
          <div className="mt-24 sm:mt-32 max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
                Join the Waitlist
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8">
              Be among the first to experience the future of email management.
              Get early access and exclusive benefits.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full max-w-md px-6 py-3 rounded-full bg-purple-900/20 border border-purple-800/30 focus:border-purple-500 outline-none transition-colors"
                required
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 transition-colors px-8 py-3 rounded-full font-medium text-lg"
              >
                Join Waitlist
              </button>
            </form>
            {submitted && (
              <div className="mt-4 text-green-400 flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Thank you for joining! We'll be in touch soon.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-purple-800/30 mt-24 sm:mt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Plans</a></li>
                  <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Connect</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Github className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Linkedin className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-purple-800/30 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Mail className="w-6 h-6 text-purple-400" />
                <span className="font-bold bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
                  AutoMailX
                </span>
              </div>
              <div className="text-gray-400 text-center md:text-left">
                © 2024 AutoMailX. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;