import { Users, BookOpen, Sprout, Handshake } from "lucide-react";

const pillars = [
  {
    icon: Users,
    title: "Accompagner",
    description: "Nous soutenons les initiatives locales et les porteurs de projets pour un impact durable.",
  },
  {
    icon: BookOpen,
    title: "Éduquer",
    description: "Nous favorisons l'accès à l'éducation et à la formation pour tous.",
  },
  {
    icon: Sprout,
    title: "Développer",
    description: "Nous mettons en œuvre des projets concrets pour améliorer les conditions de vie.",
  },
  {
    icon: Handshake,
    title: "Fédérer",
    description: "Nous créons des liens solides entre les acteurs du changement et les communautés.",
  },
];

export default function MissionSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 xl:px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
            Notre Mission
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-primary">
            Agir aujourd&apos;hui pour un avenir durable
          </h2>
          <div className="w-12 h-1 bg-accent rounded-full mx-auto mt-4" />
        </div>

        {/* 4 pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group text-center p-8 rounded-2xl border border-gray-100 hover:border-accent/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 bg-primary/5 group-hover:bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors">
                <Icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-3">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
