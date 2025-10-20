import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900/50 border-t border-slate-700/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
          {/* Left side - Company info */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8">
              <img 
                src="/solpulsen_logo-0.png" 
                alt="SolPulsen" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-white font-bold text-sm">SolPulsen</p>
              <p className="text-slate-400 text-xs">Premium CRM för energibranschen</p>
            </div>
          </div>

          {/* Center - Certifications */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-slate-400 text-xs mb-2">Certifierad av:</p>
              <div className="flex items-center space-x-4">
                <img 
                  src="/solcerticcate.png" 
                  alt="Certifieringar" 
                  className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>

          {/* Right side - Copyright */}
          <div className="text-center md:text-right">
            <p className="text-slate-400 text-xs">
              © {new Date().getFullYear()} SolPulsen. Alla rättigheter förbehållna.
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Utvecklad med ❤️ för energibranschen
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

