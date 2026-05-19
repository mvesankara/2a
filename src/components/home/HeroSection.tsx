import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#F0F4F3] overflow-hidden pt-20">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none">
        <div className="absolute top-10 right-0 w-full h-full bg-primary/5 transform -skew-x-6 origin-top-right" />
      </div>

      <div className="container mx-auto px-4 xl:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-80px)] py-16">
          {/* Left content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              🌍 Association au Gabon
            </div>

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-black text-primary leading-tight mb-4">
              Lendemain meilleur,
              <br />
              <span className="text-primary">Lendemain fière</span>
            </h1>

            {/* Gold accent bar */}
            <div className="w-16 h-1.5 bg-accent rounded-full mb-6" />

            <p className="text-gray-600 text-lg leading-relaxed max-w-lg mb-10">
              Acteurs de l&apos;Avenir est une association engagée pour accompagner
              la mise en place de solutions durables visant à améliorer les conditions
              de vie des populations en difficulté au Gabon.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/projets"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-7 py-3.5 rounded-full hover:bg-primary/90 transition-colors group"
              >
                Découvrir nos projets
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center justify-center gap-3 border-2 border-primary text-primary font-semibold px-7 py-3.5 rounded-full hover:bg-primary hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-full border-2 border-primary group-hover:border-white flex items-center justify-center flex-shrink-0">
                  <Play size={12} className="ml-0.5" />
                </span>
                Voir notre vidéo
              </button>
            </div>
          </div>

          {/* Right — image area */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Geometric shape with image placeholder */}
            <div className="relative w-full max-w-lg">
              {/* Main image container with diagonal clip */}
              <div
                className="relative h-[520px] bg-primary/20 rounded-3xl overflow-hidden"
                style={{ clipPath: "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-primary/80 flex items-center justify-center">
                  {/* Placeholder — replace with <Image> when you have the real photo */}
                  <div className="text-center text-white/60 p-8">
                    <div className="text-6xl mb-4">🌍</div>
                    <p className="text-sm">Photo principale à ajouter ici<br /><span className="text-xs opacity-70">public/images/hero.jpg</span></p>
                  </div>
                </div>
              </div>

              {/* Gold accent triangle */}
              <div
                className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/30 rounded-xl"
                style={{ clipPath: "polygon(100% 0%, 0% 100%, 100% 100%)" }}
              />

              {/* Stats badge */}
              <div className="absolute -bottom-6 left-8 bg-white rounded-2xl shadow-xl px-6 py-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-primary">250+</p>
                  <p className="text-xs text-gray-500">Bénéficiaires soutenus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
