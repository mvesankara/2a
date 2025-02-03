import React from "react";
import { Facebook, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">2A</h3>
            <p className="text-white/80">
              Construisons ensemble un lendemain meilleur et plus fier.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/80 hover:text-accent transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-accent transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-accent transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-white/80">
              Email: contact@2a.com
              <br />
              Tel: +33 1 23 45 67 89
            </p>
            <div className="mt-4 flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/80 hover:text-accent transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/80 hover:text-accent transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/80 hover:text-accent transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>&copy; 2024 2A. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;