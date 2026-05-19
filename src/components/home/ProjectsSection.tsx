import Link from "next/link";
import { ArrowRight, GraduationCap, Leaf, Heart } from "lucide-react";

interface Project {
  id: string;
  name: string;
  shortDescription: string | null;
  category: string | null;
  imageUrl: string | null;
}

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Éducation": { icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
  "Environnement": { icon: Leaf, color: "text-green-600", bg: "bg-green-50" },
  "Inclusion sociale": { icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
};

function ProjectCard({ project }: { project: Project }) {
  const config = categoryConfig[project.category ?? ""] ?? {
    icon: GraduationCap,
    color: "text-primary",
    bg: "bg-primary/10",
  };
  const Icon = config.icon;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image / placeholder */}
      <div className="relative h-52 bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center overflow-hidden">
        {project.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.imageUrl}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-primary/40">
            <Icon size={48} />
            <span className="text-xs">Photo à venir</span>
          </div>
        )}
        {/* Category badge */}
        {project.category && (
          <span className={`absolute top-3 left-3 ${config.bg} ${config.color} text-xs font-semibold px-3 py-1 rounded-full`}>
            {project.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-primary mb-2">{project.name}</h3>
        <p className="text-gray-500 text-sm leading-relaxed flex-1">
          {project.shortDescription}
        </p>
        <Link
          href={`/projets/${project.id}`}
          className="inline-flex items-center gap-1 text-accent font-semibold text-sm mt-5 hover:gap-2 transition-all group"
        >
          En savoir plus
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <section className="py-24 bg-[#F8F7F2]">
      <div className="container mx-auto px-4 xl:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
              Nos Projets
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-primary">
              Des actions concrètes sur le terrain
            </h2>
          </div>
          <Link
            href="/projets"
            className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:text-accent transition-colors flex-shrink-0"
          >
            Voir tous les projets <ArrowRight size={16} />
          </Link>
        </div>

        {/* Cards */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p>Aucun projet publié pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
