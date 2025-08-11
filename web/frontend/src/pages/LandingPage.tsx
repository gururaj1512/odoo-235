import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Star, TrendingUp, Play } from 'lucide-react';
import HeroAnimation from '@/components/HeroAnimation';

const LandingPage = () => {
  const [activePlayersCount, setActivePlayersCount] = useState(1247);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePlayersCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const sports = [
    { name: 'Badminton', icon: '🏸', active: true },
    { name: 'Tennis', icon: '🎾' },
    { name: 'Cricket', icon: '🏏' },
    { name: 'Football', icon: '⚽' },
    { name: 'Basketball', icon: '🏀' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-qc-bg via-white to-qc-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-qc-text leading-tight">
                  Book courts.{' '}
                  <span className="text-qc-primary">Find teammates.</span>{' '}
                  <span className="text-qc-accent">Play more.</span>
                </h1>
                
                <p className="text-xl text-gray-600 max-w-lg">
                  Discover local sports venues, connect with players of your skill level, 
                  and book your perfect game in seconds.
                </p>
              </div>

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

      {/* Quick Sports Filter */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {sports.map((sport, index) => (
              <button
                key={sport.name}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                  sport.active
                    ? 'bg-qc-primary text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{sport.icon}</span>
                <span className="font-medium">{sport.name}</span>
              </button>
            ))}
          </div>
        </div>
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
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Play?
          </h2>
          <p className="text-xl text-qc-primary/80 mb-8 max-w-2xl mx-auto">
            Join thousands of players who are already booking courts and finding teammates on QuickCourt
          </p>
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
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
