import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Projects
  await prisma.project.upsert({
    where: { id: "proj-education-001" },
    update: { progress: 70 },
    create: {
      id: "proj-education-001",
      name: "Éducation numérique pour tous",
      category: "Éducation",
      shortDescription: "Améliorer l'accès à une éducation de qualité dans les zones défavorisées.",
      description: "Ce projet vise à améliorer l'accès à une éducation de qualité dans les zones défavorisées du Gabon en construisant des salles de classe, en formant des enseignants et en fournissant du matériel scolaire.",
      imageUrl: null,
      isPublished: true,
      status: "en_cours",
      progress: 70,
      endDate: new Date("2025-06-30"),
    },
  });

  await prisma.project.upsert({
    where: { id: "proj-environment-002" },
    update: { progress: 40 },
    create: {
      id: "proj-environment-002",
      name: "Environnement durable au Gabon",
      category: "Environnement",
      shortDescription: "Sensibiliser et agir pour la préservation de notre environnement.",
      description: "Programme de sensibilisation et d'action pour la préservation de l'environnement au Gabon : reboisement, gestion des déchets, éducation environnementale dans les écoles.",
      imageUrl: null,
      isPublished: true,
      status: "en_cours",
      progress: 40,
      endDate: new Date("2025-08-15"),
    },
  });

  await prisma.project.upsert({
    where: { id: "proj-women-003" },
    update: { progress: 80, status: "en_revue" },
    create: {
      id: "proj-women-003",
      name: "Autonomisation des femmes",
      category: "Inclusion sociale",
      shortDescription: "Soutenir les femmes dans l'entrepreneuriat et le développement de compétences.",
      description: "Programme d'autonomisation économique et sociale des femmes gabonaises : formation professionnelle, accompagnement à la création d'entreprise, accès au microcrédit.",
      imageUrl: null,
      isPublished: true,
      status: "en_revue",
      progress: 80,
      endDate: new Date("2025-06-10"),
    },
  });

  // Stats
  const stats = [
    { key: "beneficiaires", value: "250+", label: "Bénéficiaires soutenus", icon: "Users", order: 1 },
    { key: "projets", value: "18", label: "Projets réalisés", icon: "FolderCheck", order: 2 },
    { key: "partenaires", value: "35", label: "Partenaires engagés", icon: "Handshake", order: 3 },
    { key: "localites", value: "9", label: "Localités impactées", icon: "MapPin", order: 4 },
  ];

  for (const stat of stats) {
    await prisma.stat.upsert({
      where: { key: stat.key },
      update: { value: stat.value, label: stat.label },
      create: stat,
    });
  }

  // Documents organisationnels publics
  const docs = [
    { id: "doc-001", name: "Carte membre 2A", fileType: "PDF", sizeBytes: 450 * 1024 },
    { id: "doc-002", name: "Guide du membre", fileType: "PDF", sizeBytes: Math.round(1.2 * 1024 * 1024) },
    { id: "doc-003", name: "Charte de l'association", fileType: "PDF", sizeBytes: 800 * 1024 },
    { id: "doc-004", name: "Rapport d'activités 2024", fileType: "PDF", sizeBytes: Math.round(3.4 * 1024 * 1024) },
  ];
  for (const doc of docs) {
    await prisma.document.upsert({
      where: { id: doc.id },
      update: {},
      create: { ...doc, isPublic: true },
    });
  }

  // Seed demo event for dashboard
  await prisma.event.upsert({
    where: { id: "evt-001" },
    update: {},
    create: {
      id: "evt-001",
      title: "Atelier : Leadership et impact",
      description: "Atelier de formation sur le leadership et l'impact social.",
      location: "Libreville",
      startDate: new Date("2025-05-25T09:00:00"),
      type: "atelier",
    },
  });
  await prisma.event.upsert({
    where: { id: "evt-002" },
    update: {},
    create: {
      id: "evt-002",
      title: "Journée de reboisement",
      description: "Journée d'action pour le reboisement au Gabon.",
      location: "Owendo",
      startDate: new Date("2025-06-10T08:00:00"),
      type: "action",
    },
  });
  await prisma.event.upsert({
    where: { id: "evt-003" },
    update: {},
    create: {
      id: "evt-003",
      title: "Forum des jeunes acteurs",
      description: "Forum national des jeunes acteurs du changement.",
      location: "Libreville",
      startDate: new Date("2025-06-22T09:00:00"),
      type: "forum",
    },
  });

  console.log("✓ Seed terminé");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
