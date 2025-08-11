import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

const HeroAnimation = () => {
  const [bounceY, setBounceY] = useState(0);

  useEffect(() => {
    const animate = () => {
      setBounceY(prev => (prev + 0.02) % (Math.PI * 2));
    };
    
    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Court Background */}
      <div className="relative w-80 h-80 bg-gradient-to-br from-qc-primary/10 to-qc-accent/10 rounded-3xl overflow-hidden">
        {/* Court Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 320 320">
          <rect x="40" y="40" width="240" height="240" fill="none" stroke="#0B6B63" strokeWidth="2" rx="12"/>
          <line x1="160" y1="40" x2="160" y2="280" stroke="#0B6B63" strokeWidth="1"/>
          <line x1="40" y1="160" x2="280" y2="160" stroke="#0B6B63" strokeWidth="1"/>
          <circle cx="160" cy="160" r="30" fill="none" stroke="#FFB020" strokeWidth="2"/>
        </svg>

        {/* Floating Court Pins */}
        {[
          { x: 80, y: 80, delay: 0 },
          { x: 240, y: 120, delay: 1 },
          { x: 120, y: 200, delay: 2 },
          { x: 220, y: 240, delay: 0.5 },
        ].map((pin, index) => (
          <div
            key={index}
            className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: pin.x,
              top: pin.y,
              animation: `pulse 2s infinite ${pin.delay}s ease-in-out`,
            }}
          >
            <MapPin className="w-6 h-6 text-qc-primary" />
            <div className="absolute top-0 left-0 w-6 h-6 bg-qc-primary/20 rounded-full animate-ping"></div>
          </div>
        ))}

        {/* Bouncing Ball */}
        <div
          className="absolute w-8 h-8 bg-qc-accent rounded-full shadow-lg transition-transform duration-75"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translateY(${Math.sin(bounceY) * 20}px)`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-qc-accent to-orange-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-10 right-10 w-4 h-4 bg-qc-lilac/40 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-6 h-6 bg-qc-accent/30 rounded-full animate-bounce"></div>
      </div>

      {/* Floating action bubbles */}
      <div className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-lg animate-float">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs font-medium text-gray-700">Court Available</span>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-lg animate-float-delayed">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-qc-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
            4
          </div>
          <span className="text-xs font-medium text-gray-700">Players Online</span>
        </div>
      </div>
    </div>
  );
};

export default HeroAnimation;
