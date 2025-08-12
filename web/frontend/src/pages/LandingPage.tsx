import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Star, 
  TrendingUp, 
  Play, 
  Building2,
  Calendar,
  BarChart3,
  Mail,
  Phone,
  Heart,
  Shield,
  Zap,
  Award
} from 'lucide-react';
import { RootState } from '@/redux/store';
import HeroAnimation from '@/components/HeroAnimation';

const LandingPage: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activePlayersCount, setActivePlayersCount] = useState(0);
  
  useEffect(() => {
    // Set a realistic base count instead of random increments
    setActivePlayersCount(1247);
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'Owner':
        return '/owner-dashboard';
      case 'Admin':
        return '/admin-dashboard';
      default:
        return '/dashboard';
    }
  };

  const getAuthButtons = () => {
    if (isAuthenticated && user) {
      return (
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to={getDashboardPath()}
            className="inline-flex items-center justify-center px-8 py-4 bg-qc-accent text-white font-semibold rounded-qc-radius hover:bg-qc-accent/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
          
          <Link
            to="/facilities"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-qc-primary text-qc-primary font-semibold rounded-qc-radius hover:bg-qc-primary hover:text-white transition-all duration-300"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Browse Facilities
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/facilities"
          className="inline-flex items-center justify-center px-8 py-4 bg-qc-accent text-white font-semibold rounded-qc-radius hover:bg-qc-accent/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <MapPin className="w-5 h-5 mr-2" />
          Find a Court
        </Link>
        
        <Link
          to="/register"
          className="inline-flex items-center justify-center px-8 py-4 border-2 border-qc-primary text-qc-primary font-semibold rounded-qc-radius hover:bg-qc-primary hover:text-white transition-all duration-300"
        >
          <Users className="w-5 h-5 mr-2" />
          Host a Court
        </Link>
      </div>
    );
  };

  const getCTAButtons = () => {
    if (isAuthenticated && user) {
      return (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={getDashboardPath()}
            className="inline-flex items-center justify-center px-8 py-4 bg-qc-accent text-white font-semibold rounded-qc-radius hover:bg-qc-accent/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
          <Link
            to="/facilities"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-qc-radius hover:bg-white hover:text-qc-primary transition-all duration-300"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Browse Facilities
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/register"
          className="inline-flex items-center justify-center px-8 py-4 bg-qc-accent text-white font-semibold rounded-qc-radius hover:bg-qc-accent/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Play className="w-5 h-5 mr-2" />
          Get Started Free
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-qc-radius hover:bg-white hover:text-qc-primary transition-all duration-300"
        >
          Sign In
        </Link>
      </div>
    );
  };

  // Remove static sports array - will be fetched from Redux if needed

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-qc-bg via-white to-qc-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 font-medium">Welcome back, {user.name}!</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-bold text-qc-text leading-tight">
                      Ready to{' '}
                      <span className="text-qc-primary">play today?</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-lg">
                      Jump back into the game! Book your favorite court or discover new facilities near you.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-5xl lg:text-6xl font-bold text-qc-text leading-tight">
                      Book courts.{' '}
                      <span className="text-qc-primary">Find teammates.</span>{' '}
                      <span className="text-qc-accent">Play more.</span>
                    </h1>
                    
                    <p className="text-xl text-gray-600 max-w-lg">
                      Discover local sports venues, connect with players of your skill level, 
                      and book your perfect game in seconds.
                    </p>
                  </>
                )}
              </div>

              {getAuthButtons()}

              {/* Trust Strip */}
              <div className="flex items-center space-x-8 pt-8 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-bold text-qc-primary">{activePlayersCount.toLocaleString()}</span> active players
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-qc-accent fill-current" />
                  <span className="text-sm font-bold text-qc-text">4.9</span>
                  <span className="text-sm text-gray-600">(2.3k reviews)</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-qc-primary" />
                  <span className="text-sm text-gray-600">Growing 25% monthly</span>
                </div>
              </div>
            </div>

            {/* Right Animation */}
            <div className="relative lg:h-96">
              <HeroAnimation />
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 right-10 w-16 h-16 bg-qc-accent/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-10 w-8 h-8 bg-qc-primary/20 rounded-full animate-pulse"></div>
      </section>



      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-qc-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-qc-text mb-4">
              Why QuickCourt?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make sports booking effortless with smart matching and instant reservations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Smart Matching',
                description: 'Our Skill-ID system matches you with players of similar ability for better games'
              },
              {
                icon: '⚡',
                title: 'Instant Booking',
                description: 'Book courts in seconds with real-time availability and secure payment'
              },
              {
                icon: '🏆',
                title: 'Tournament Mode',
                description: 'Create and join tournaments with automated bracket management'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-qc-text mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-qc-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isAuthenticated && user ? (
            <>
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready for Your Next Game?
              </h2>
              <p className="text-xl text-qc-primary/80 mb-8 max-w-2xl mx-auto">
                Continue your sports journey with QuickCourt. Book courts, join tournaments, and connect with fellow players.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Play?
              </h2>
              <p className="text-xl text-qc-primary/80 mb-8 max-w-2xl mx-auto">
                Join thousands of players who are already booking courts and finding teammates on QuickCourt
              </p>
            </>
          )}
          {getCTAButtons()}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-8 h-8 text-qc-primary" />
                <span className="text-xl font-bold">QuickCourt</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The ultimate platform for sports enthusiasts to discover, book, and connect. 
                Making sports accessible to everyone, everywhere.
              </p>

            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/facilities" className="text-gray-400 hover:text-qc-primary transition-colors text-sm">
                    Find Facilities
                  </Link>
                </li>
                {!isAuthenticated && (
                  <>
                    <li>
                      <Link to="/register" className="text-gray-400 hover:text-qc-primary transition-colors text-sm">
                        Host a Court
                      </Link>
                    </li>
                    <li>
                      <Link to="/login" className="text-gray-400 hover:text-qc-primary transition-colors text-sm">
                        Sign In
                      </Link>
                    </li>
                  </>
                )}
                {isAuthenticated && (
                  <>
                    <li>
                      <Link to={getDashboardPath()} className="text-gray-400 hover:text-qc-primary transition-colors text-sm">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/bookings" className="text-gray-400 hover:text-qc-primary transition-colors text-sm">
                        My Bookings
                      </Link>
                    </li>
                  </>
                )}

              </ul>
            </div>



            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-qc-primary" />
                  <span className="text-gray-400 text-sm">support@quickcourt.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-qc-primary" />
                  <span className="text-gray-400 text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-qc-primary" />
                  <span className="text-gray-400 text-sm">Mumbai, Maharashtra, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>&copy; 2024 QuickCourt. All rights reserved.</span>
                <span className="hidden md:inline">•</span>

              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>in India</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
