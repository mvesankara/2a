import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Projects (28 projets réalistes) ─────────────────────────────────────────

const PROJECTS = [
  // en_cours = "Actif" (12)
  { id: "proj-001", name: "Éducation numérique pour tous",       category: "Éducation",    city: "Libreville",  status: "en_cours", progress: 70, short: "Renforcer l'accès à l'éducation numérique dans les communautés rurales.", date: "2025-04-30" },
  { id: "proj-003", name: "Autonomisation des femmes",            category: "Social",       city: "Franceville", status: "en_cours", progress: 80, short: "Soutenir les femmes à travers la formation et l'entrepreneuriat.", date: "2025-04-10" },
  { id: "proj-004", name: "Santé communautaire",                  category: "Santé",        city: "Libreville",  status: "en_cours", progress: 60, short: "Améliorer l'accès aux soins de santé dans les quartiers défavorisés.", date: "2025-04-05" },
  { id: "proj-007", name: "Alphabétisation des adultes",          category: "Éducation",    city: "Mouila",      status: "en_cours", progress: 45, short: "Réduire l'analphabétisme chez les adultes dans les zones rurales.", date: "2025-03-20" },
  { id: "proj-008", name: "Microfinance solidaire",               category: "Social",       city: "Libreville",  status: "en_cours", progress: 55, short: "Faciliter l'accès au crédit pour les petits entrepreneurs.", date: "2025-03-15" },
  { id: "proj-009", name: "Jardins communautaires",               category: "Environnement", city: "Owendo",     status: "en_cours", progress: 65, short: "Créer des espaces verts et nourriciers dans les quartiers urbains.", date: "2025-03-10" },
  { id: "proj-011", name: "Bibliothèques mobiles",                category: "Éducation",    city: "Lambaréné",   status: "en_cours", progress: 50, short: "Apporter la lecture aux zones enclavées par des médiathèques mobiles.", date: "2025-02-25" },
  { id: "proj-012", name: "Eau potable pour tous",                category: "Santé",        city: "Port-Gentil", status: "en_cours", progress: 75, short: "Installer des points d'eau potable dans les villages sans accès.", date: "2025-02-20" },
  { id: "proj-013", name: "Leadership féminin",                   category: "Social",       city: "Libreville",  status: "en_cours", progress: 40, short: "Former des femmes leaders pour les instances de décision.", date: "2025-02-15" },
  { id: "proj-014", name: "Recyclage plastique",                  category: "Environnement", city: "Libreville", status: "en_cours", progress: 30, short: "Collecter et recycler les déchets plastiques en produits utiles.", date: "2025-02-10" },
  { id: "proj-015", name: "Insertion professionnelle",            category: "Jeunesse",     city: "Libreville",  status: "en_cours", progress: 58, short: "Accompagner les jeunes diplômés vers leur premier emploi.", date: "2025-02-05" },
  { id: "proj-016", name: "Sport & citoyenneté",                  category: "Jeunesse",     city: "Franceville", status: "en_cours", progress: 62, short: "Utiliser le sport comme vecteur d'inclusion et de valeurs civiques.", date: "2025-01-30" },
  // en_revue = "En cours de réalisation" (8)
  { id: "proj-002", name: "Environnement durable au Gabon",       category: "Environnement", city: "Port-Gentil", status: "en_revue", progress: 40, short: "Promouvoir les initiatives écologiques pour la protection de notre environnement.", date: "2025-04-15" },
  { id: "proj-005", name: "Énergie solaire pour tous",            category: "Innovation",   city: "Oyem",        status: "en_revue", progress: 35, short: "Installer des solutions solaires dans les zones non électrifiées.", date: "2025-03-28" },
  { id: "proj-017", name: "Agriculture intelligente",             category: "Innovation",   city: "Mouila",      status: "en_revue", progress: 25, short: "Introduire des techniques agricoles durables et rentables.", date: "2025-01-25" },
  { id: "proj-018", name: "Artisanat digital",                    category: "Innovation",   city: "Libreville",  status: "en_revue", progress: 48, short: "Connecter les artisans locaux aux marchés en ligne nationaux.", date: "2025-01-20" },
  { id: "proj-019", name: "Reforestation nationale",              category: "Environnement", city: "Lambaréné",  status: "en_revue", progress: 20, short: "Planter un million d'arbres sur l'ensemble du territoire gabonais.", date: "2025-01-15" },
  { id: "proj-020", name: "Prévention santé mentale",             category: "Santé",        city: "Libreville",  status: "en_revue", progress: 33, short: "Sensibiliser et accompagner sur les enjeux de la santé mentale.", date: "2025-01-10" },
  { id: "proj-021", name: "Coopératives de femmes rurales",       category: "Social",       city: "Oyem",        status: "en_revue", progress: 42, short: "Structurer les activités économiques des femmes en milieu rural.", date: "2024-12-20" },
  { id: "proj-022", name: "Innovation pédagogique",               category: "Éducation",    city: "Libreville",  status: "en_revue", progress: 15, short: "Moderniser les méthodes d'enseignement dans les écoles publiques.", date: "2024-12-15" },
  // cloture = "Terminé" (8)
  { id: "proj-006", name: "Jeunes acteurs du changement",         category: "Jeunesse",     city: "Mouila",      status: "cloture",  progress: 100, short: "Former et accompagner les jeunes leaders communautaires.", date: "2025-02-12" },
  { id: "proj-023", name: "Festival culturel 2024",               category: "Social",       city: "Libreville",  status: "cloture",  progress: 100, short: "Célébrer la diversité culturelle du Gabon en rassemblant artistes.", date: "2024-12-10" },
  { id: "proj-024", name: "Campagne vaccination rurale",          category: "Santé",        city: "Franceville", status: "cloture",  progress: 100, short: "Atteindre les populations rurales éloignées pour la vaccination.", date: "2024-11-30" },
  { id: "proj-025", name: "Éco-construction Libreville",          category: "Environnement", city: "Libreville", status: "cloture",  progress: 100, short: "Construire des bâtiments communautaires avec des matériaux locaux.", date: "2024-11-15" },
  { id: "proj-026", name: "Formation numérique femmes",           category: "Innovation",   city: "Port-Gentil", status: "cloture",  progress: 100, short: "Initier 500 femmes aux outils numériques et à l'informatique.", date: "2024-10-30" },
  { id: "proj-027", name: "Tournoi sportif intercommunal",        category: "Jeunesse",     city: "Oyem",        status: "cloture",  progress: 100, short: "Organiser des compétitions sportives entre communautés pour l'unité.", date: "2024-10-15" },
  { id: "proj-028", name: "Reboisement Estuaire",                 category: "Environnement", city: "Libreville", status: "cloture",  progress: 100, short: "Replanter 50 000 arbres sur les zones côtières dégradées de l'Estuaire.", date: "2024-09-30" },
  { id: "proj-029", name: "Entrepreneurs sociaux 2024",           category: "Social",       city: "Mouila",      status: "cloture",  progress: 100, short: "Accompagner 30 entrepreneurs sociaux vers l'autonomie et la viabilité.", date: "2024-09-15" },
];

async function main() {
  // ─── Projects ───────────────────────────────────────────────────────────────
  for (const p of PROJECTS) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: { progress: p.progress, status: p.status as any, city: p.city, country: "Gabon", category: p.category },
      create: {
        id: p.id,
        name: p.name,
        category: p.category,
        shortDescription: p.short,
        description: p.short,
        imageUrl: null,
        isPublished: true,
        status: p.status as any,
        progress: p.progress,
        city: p.city,
        country: "Gabon",
        createdAt: new Date(p.date),
      },
    });
  }

  // ─── Enrichir proj-001 avec données de détail ────────────────────────────

  // Mise à jour des champs détail du projet phare
  await prisma.project.update({
    where: { id: "proj-001" },
    data: {
      description: "Ce projet vise à réduire la fracture numérique en offrant des formations en compétences numériques de base aux jeunes et aux adultes dans les zones rurales. Il inclut également la mise à disposition d'équipements informatiques et l'accès à internet dans les centres communautaires.",
      objectives: "Former 200 jeunes et adultes aux compétences numériques de base\nÉquiper 5 centres communautaires en matériel informatique\nFavoriser l'accès à des ressources éducatives en ligne",
      targetBeneficiaries: "Jeunes 15-35 ans et adultes des zones rurales de la province de l'Estuaire. 200 bénéficiaires directs estimés.",
      budget: 5_000_000,
      budgetSpent: 3_500_000,
      budgetSources: "Subvention 2A, fonds propres, mécénat local",
      humanResources: "1 coordinateur, 3 formateurs, 5 bénévoles",
      priority: "elevee",
      startDate: new Date("2025-04-01"),
      endDate: new Date("2025-06-30"),
      estimatedDuration: "3 mois",
    },
  });

  // Activités de proj-001
  const activities001 = [
    { id: "act-001-1", title: "Atelier de formation – Initiation à l'informatique", date: new Date("2025-05-05"), status: "termine", order: 1 },
    { id: "act-001-2", title: "Installation des équipements au centre de Bambouchine", date: new Date("2025-05-20"), status: "termine", order: 2 },
    { id: "act-001-3", title: "Session de formation – Bureautique (niveau 1)", date: new Date("2025-06-10"), status: "en_cours", order: 3 },
    { id: "act-001-4", title: "Évaluation des compétences des participants", date: null, status: "a_planifier", order: 4 },
  ];
  for (const act of activities001) {
    await prisma.projectActivity.upsert({
      where: { id: act.id },
      update: {},
      create: { ...act, projectId: "proj-001" },
    });
  }

  // Indicateurs de proj-001
  const indicators001 = [
    { id: "ind-001-1", label: "Participants formés",          current: 140, target: 200, unit: null, order: 1 },
    { id: "ind-001-2", label: "Centres équipés",             current: 3,   target: 5,   unit: null, order: 2 },
    { id: "ind-001-3", label: "Accès internet opérationnels", current: 3,   target: 5,   unit: null, order: 3 },
  ];
  for (const ind of indicators001) {
    await prisma.projectIndicator.upsert({
      where: { id: ind.id },
      update: { current: ind.current },
      create: { ...ind, projectId: "proj-001" },
    });
  }

  // Documents liés à proj-001
  const projDocs = [
    { id: "pdoc-001-1", name: "Plan de projet",       fileType: "PDF",  sizeBytes: Math.round(1.2 * 1024 * 1024), projectId: "proj-001" },
    { id: "pdoc-001-2", name: "Budget détaillé",      fileType: "XLSX", sizeBytes: Math.round(0.45 * 1024 * 1024), projectId: "proj-001" },
    { id: "pdoc-001-3", name: "Rapport intermédiaire", fileType: "PDF",  sizeBytes: Math.round(2.1 * 1024 * 1024), projectId: "proj-001" },
  ];
  for (const doc of projDocs) {
    await prisma.document.upsert({
      where: { id: doc.id },
      update: {},
      create: { ...doc, isPublic: false },
    });
  }

  // ─── Utilisateurs demo pour l'équipe de proj-001 ─────────────────────────

  const demoPwd = bcrypt.hashSync("Demo2025!", 10);

  const demoTeam = [
    { userId: "user-kevin-demo", email: "kevin.demo@2a.ga", profileId: "prof-kevin-demo", firstName: "Kevin", lastName: "M. A.", memberRole: "Formateur" },
    { userId: "user-marie-demo", email: "marie.demo@2a.ga", profileId: "prof-marie-demo", firstName: "Marie", lastName: "T. A.", memberRole: "Coordinatrice" },
    { userId: "user-pauline-demo", email: "pauline.demo@2a.ga", profileId: "prof-pauline-demo", firstName: "Pauline", lastName: "A.", memberRole: "Communication" },
  ];

  for (const m of demoTeam) {
    await prisma.user.upsert({
      where: { id: m.userId },
      update: {},
      create: { id: m.userId, email: m.email, password: demoPwd },
    });
    await prisma.profile.upsert({
      where: { id: m.profileId },
      update: {},
      create: { id: m.profileId, userId: m.userId, firstName: m.firstName, lastName: m.lastName, email: m.email, status: "approved", role: "adherent" },
    });
    await prisma.projectMember.upsert({
      where: { id: `pm-${m.profileId}` },
      update: {},
      create: { id: `pm-${m.profileId}`, projectId: "proj-001", profileId: m.profileId, role: m.memberRole },
    });
  }

  // ─── 24 tâches pour proj-001 ──────────────────────────────────────────────
  // Distribution: 12 done, 6 in_progress, 4 todo, 2 overdue

  const now = new Date();
  const d = (offset: number) => { const dt = new Date(now); dt.setDate(dt.getDate() + offset); return dt; };

  const tasks001 = [
    // DONE (12)
    { id: "task-001-01", title: "Identifier les formateurs locaux",          desc: "Sélectionner et valider les formateurs",           profileId: "prof-pauline-demo", status: "done",        priority: "normal", dueDate: d(-25), progress: 100 },
    { id: "task-001-02", title: "Rédiger le cahier des charges",             desc: "Définir les besoins et spécifications du projet",  profileId: "prof-marie-demo",   status: "done",        priority: "high",   dueDate: d(-30), progress: 100 },
    { id: "task-001-03", title: "Sélectionner les centres communautaires",   desc: "Choisir 5 centres cibles pour la formation",       profileId: "prof-kevin-demo",   status: "done",        priority: "high",   dueDate: d(-20), progress: 100 },
    { id: "task-001-04", title: "Signer les conventions de partenariat",     desc: "Formaliser les accords avec les partenaires",      profileId: "prof-marie-demo",   status: "done",        priority: "normal", dueDate: d(-18), progress: 100 },
    { id: "task-001-05", title: "Former l'équipe pédagogique",               desc: "Briefing des formateurs sur le programme",         profileId: "prof-kevin-demo",   status: "done",        priority: "normal", dueDate: d(-15), progress: 100 },
    { id: "task-001-06", title: "Installer les équipements au centre 1",     desc: "Centre de Bambouchine – ordinateurs et réseau",    profileId: "prof-marie-demo",   status: "done",        priority: "high",   dueDate: d(-12), progress: 100 },
    { id: "task-001-07", title: "Session initiation informatique C1",        desc: "Module 1 : bases de l'informatique",               profileId: "prof-kevin-demo",   status: "done",        priority: "normal", dueDate: d(-10), progress: 100 },
    { id: "task-001-08", title: "Session initiation informatique C2",        desc: "Module 1 au centre 2",                             profileId: "prof-kevin-demo",   status: "done",        priority: "normal", dueDate: d(-8),  progress: 100 },
    { id: "task-001-09", title: "Évaluation mi-parcours",                    desc: "Évaluation des compétences acquises à mi-projet",  profileId: "prof-pauline-demo", status: "done",        priority: "normal", dueDate: d(-5),  progress: 100 },
    { id: "task-001-10", title: "Rapport mi-parcours",                       desc: "Rédiger et soumettre le rapport intermédiaire",    profileId: "prof-marie-demo",   status: "done",        priority: "normal", dueDate: d(-3),  progress: 100 },
    { id: "task-001-11", title: "Installer les équipements au centre 2",     desc: "Matériel informatique et accès internet",          profileId: "prof-marie-demo",   status: "done",        priority: "high",   dueDate: d(-4),  progress: 100 },
    { id: "task-001-12", title: "Installer les équipements au centre 3",     desc: "Déploiement et configuration réseau",              profileId: "prof-marie-demo",   status: "review",      priority: "high",   dueDate: d(-1),  progress: 100 },
    // EN COURS (6)
    { id: "task-001-13", title: "Concevoir le programme de formation",       desc: "Définir les modules et contenus pédagogiques",    profileId: "prof-kevin-demo",   status: "in_progress", priority: "high",   dueDate: d(3),  progress: 60 },
    { id: "task-001-14", title: "Achat des ordinateurs et équipements",      desc: "Acquérir 25 ordinateurs et accessoires",          profileId: "prof-marie-demo",   status: "in_progress", priority: "high",   dueDate: d(8),  progress: 40 },
    { id: "task-001-15", title: "Session de formation – Bureautique niv. 1", desc: "Module bureautique pour les participants",         profileId: "prof-kevin-demo",   status: "in_progress", priority: "normal", dueDate: d(5),  progress: 35 },
    { id: "task-001-16", title: "Configurer l'accès internet au centre 4",   desc: "Installation fibre et routeur WiFi",               profileId: "prof-marie-demo",   status: "in_progress", priority: "normal", dueDate: d(10), progress: 50 },
    { id: "task-001-17", title: "Sensibilisation communauté centre 3",       desc: "Mobilisation et inscription des bénéficiaires",   profileId: "prof-pauline-demo", status: "in_progress", priority: "normal", dueDate: d(7),  progress: 70 },
    { id: "task-001-18", title: "Mise à jour du plan de formation",          desc: "Intégrer les retours mi-parcours",                 profileId: "prof-kevin-demo",   status: "in_progress", priority: "low",    dueDate: d(14), progress: 25 },
    // EN ATTENTE (4)
    { id: "task-001-19", title: "Préparer les supports pédagogiques",        desc: "Créer manuels et guides d'utilisation",           profileId: "prof-kevin-demo",   status: "todo",        priority: "normal", dueDate: d(13), progress: 0 },
    { id: "task-001-20", title: "Lancer la campagne de sensibilisation",     desc: "Informer les communautés sur la formation",        profileId: "prof-pauline-demo", status: "todo",        priority: "low",    dueDate: d(19), progress: 0 },
    { id: "task-001-21", title: "Recruter des bénévoles supplémentaires",    desc: "Renforcer l'équipe de terrain",                    profileId: "prof-marie-demo",   status: "todo",        priority: "low",    dueDate: d(22), progress: 0 },
    { id: "task-001-22", title: "Préparer la cérémonie de clôture",          desc: "Logistique de l'événement de fin de projet",      profileId: "prof-pauline-demo", status: "todo",        priority: "normal", dueDate: d(30), progress: 0 },
    // EN RETARD (2)
    { id: "task-001-23", title: "Aménager la salle de formation",            desc: "Installation tables, chaises et équipements",     profileId: "prof-marie-demo",   status: "in_progress", priority: "high",   dueDate: d(-7), progress: 20 },
    { id: "task-001-24", title: "Valider le budget révisé",                  desc: "Soumettre la révision budgétaire au comité",      profileId: "prof-marie-demo",   status: "todo",        priority: "high",   dueDate: d(-2), progress: 0 },
  ];

  for (const t of tasks001) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: { progress: t.progress, status: t.status as any },
      create: {
        id: t.id, title: t.title, description: t.desc,
        profileId: t.profileId, projectId: "proj-001",
        status: t.status as any, priority: t.priority,
        dueDate: t.dueDate, progress: t.progress,
      },
    });
  }

  // ─── Stats (home page) ────────────────────────────────────────────────────
  const stats = [
    { key: "beneficiaires", value: "250+", label: "Bénéficiaires soutenus", icon: "Users", order: 1 },
    { key: "projets", value: "28", label: "Projets réalisés", icon: "FolderCheck", order: 2 },
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

  // ─── Documents ────────────────────────────────────────────────────────────
  const docs = [
    { id: "doc-001", name: "Carte membre 2A",       fileType: "PDF", sizeBytes: 450 * 1024 },
    { id: "doc-002", name: "Guide du membre",        fileType: "PDF", sizeBytes: Math.round(1.2 * 1024 * 1024) },
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

  // ─── Events ───────────────────────────────────────────────────────────────
  const events = [
    { id: "evt-001", title: "Atelier : Leadership et impact",  location: "Libreville", startDate: new Date("2026-05-25T09:00:00"), type: "atelier" },
    { id: "evt-002", title: "Journée de reboisement",          location: "Owendo",     startDate: new Date("2026-06-10T08:00:00"), type: "action" },
    { id: "evt-003", title: "Forum des jeunes acteurs",        location: "Libreville", startDate: new Date("2026-06-22T09:00:00"), type: "forum" },
  ];
  for (const e of events) {
    await prisma.event.upsert({
      where: { id: e.id },
      update: {},
      create: e,
    });
  }

  console.log("✓ Seed terminé — 28 projets, 4 stats, 4 documents, 3 événements");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
