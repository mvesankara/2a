export default function MembershipHero() {
  return (
    <section className="relative bg-[#F0F4F3] overflow-hidden pt-20">
      <div className="container mx-auto px-4 xl:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[320px] py-14 gap-10">
          {/* Left */}
          <div>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
              Adhérer à l&apos;association
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight mb-4">
              Rejoignez notre
              <br />
              mouvement
            </h1>
            <div className="w-14 h-1.5 bg-accent rounded-full mb-5" />
            <p className="text-gray-600 text-base max-w-md leading-relaxed">
              Ensemble, agissons aujourd&apos;hui pour bâtir un avenir durable et solidaire pour tous.
            </p>
          </div>

          {/* Right — decorative image placeholder */}
          <div className="hidden lg:block relative h-64">
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/50 rounded-2xl flex items-center justify-center"
              style={{ clipPath: "polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%)" }}
            >
              <span className="text-5xl opacity-30">🤝</span>
            </div>
            {/* Gold accent */}
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-accent/20 rounded-xl" style={{ clipPath: "polygon(100% 0%, 0% 100%, 100% 100%)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
