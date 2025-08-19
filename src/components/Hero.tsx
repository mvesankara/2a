import React from "react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-background pt-16">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center animate-fade-in">
          <div className="mb-8">
            <img 
              src="/uploads/bbaa130c-f3b7-4490-9b40-8734722a20ef.png"
              alt="2A Logo"
              className="w-48 h-48 mx-auto object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
            Lendemain meilleur,
            <br />
            Lendemain fière
          </h1>
          <p className="text-xl text-primary/80 max-w-2xl mx-auto mb-8">
            Découvrez une nouvelle façon de voir demain, inspirée par l'art et guidée par l'innovation.
          </p>
          <button className="bg-accent hover:bg-accent-light text-primary font-semibold px-8 py-3 rounded-full transition-colors">
            Découvrir
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;