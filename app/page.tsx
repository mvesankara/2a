import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import MissionSection from "@/components/home/MissionSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import StatsSection from "@/components/home/StatsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import prisma from "@/lib/prisma";

export const revalidate = 60; // ISR : revalide toutes les 60 secondes

export default async function HomePage() {
  const [projects, stats] = await Promise.all([
    prisma.project.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        shortDescription: true,
        category: true,
        imageUrl: true,
      },
    }),
    prisma.stat.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <MissionSection />
        <ProjectsSection projects={projects} />
        <StatsSection stats={stats} />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
