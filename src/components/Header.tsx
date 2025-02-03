import React from "react";
import { Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-primary">2A</a>
          
          {/* Mobile menu button */}
          <button className="md:hidden text-primary">
            <Menu size={24} />
          </button>
          
          {/* Desktop menu */}
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-primary hover:text-primary-light transition-colors">
              Features
            </a>
            <a href="#about" className="text-primary hover:text-primary-light transition-colors">
              About
            </a>
            <a href="#contact" className="text-primary hover:text-primary-light transition-colors">
              Contact
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;