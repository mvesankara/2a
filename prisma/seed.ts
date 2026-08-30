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
  }

  // ─── Membres de proj-001 (équipe complète 10 membres) ────────────────────
  const extraMembers = [
    { userId: "user-jean-demo",   email: "jean.b@2a.ga",    profileId: "prof-jean-demo",   firstName: "Jean",    lastName: "B.",   role: "adherent" },
    { userId: "user-sophie-demo", email: "sophie.n@2a.ga",  profileId: "prof-sophie-demo", firstName: "Sophie",  lastName: "N.",   role: "adherent" },
    { userId: "user-alain-demo",  email: "alain.p@2a.ga",   profileId: "prof-alain-demo",  firstName: "Alain",   lastName: "P.",   role: "adherent" },
    { userId: "user-linda-demo",  email: "linda.k@2a.ga",   profileId: "prof-linda-demo",  firstName: "Linda",   lastName: "K.",   role: "adherent" },
    { userId: "user-mouandza-demo",email:"mouandza.k@2a.ga",profileId: "prof-mouandza-demo",firstName:"Mouandza",lastName:"K.",  role: "membre_bureau" },
    { userId: "user-grace-demo",  email: "grace.l@2a.ga",   profileId: "prof-grace-demo",  firstName: "Grace",   lastName: "L.",   role: "adherent" },
    { userId: "user-daniel-demo", email: "daniel.m@2a.ga",  profileId: "prof-daniel-demo", firstName: "Daniel",  lastName: "M.",   role: "adherent" },
  ];
  for (const m of extraMembers) {
    await prisma.user.upsert({
      where: { id: m.userId },
      update: {},
      create: { id: m.userId, email: m.email, password: demoPwd },
    });
    await prisma.profile.upsert({
      where: { id: m.profileId },
      update: {},
      create: { id: m.profileId, userId: m.userId, firstName: m.firstName, lastName: m.lastName, email: m.email, status: "approved", role: m.role as any },
    });
  }

  const proj001Members = [
    { id: "pm-prof-mouandza-demo", profileId: "prof-mouandza-demo", role: "Chef de projet", team: "Coordination",      status: "actif", createdAt: new Date("2025-03-30") },
    { id: "pm-prof-marie-demo",    profileId: "prof-marie-demo",    role: "Responsable",    team: "Pédagogie",         status: "actif", createdAt: new Date("2025-04-02") },
    { id: "pm-prof-kevin-demo",    profileId: "prof-kevin-demo",    role: "Responsable",    team: "Formation",         status: "actif", createdAt: new Date("2025-04-03") },
    { id: "pm-prof-pauline-demo",  profileId: "prof-pauline-demo",  role: "Membre",         team: "Communication",     status: "actif", createdAt: new Date("2025-04-04") },
    { id: "pm-prof-jean-demo",     profileId: "prof-jean-demo",     role: "Membre",         team: "Logistique",        status: "actif", createdAt: new Date("2025-04-05") },
    { id: "pm-prof-sophie-demo",   profileId: "prof-sophie-demo",   role: "Membre",         team: "Suivi & Évaluation",status: "actif", createdAt: new Date("2025-04-06") },
    { id: "pm-prof-alain-demo",    profileId: "prof-alain-demo",    role: "Membre",         team: "IT & Support",      status: "actif", createdAt: new Date("2025-04-07") },
    { id: "pm-prof-linda-demo",    profileId: "prof-linda-demo",    role: "Membre",         team: "Finance",           status: "actif", createdAt: new Date("2025-04-08") },
  ];
  for (const pm of proj001Members) {
    await prisma.projectMember.upsert({
      where: { id: pm.id },
      update: { role: pm.role, team: pm.team, status: pm.status },
      create: { id: pm.id, projectId: "proj-001", profileId: pm.profileId, role: pm.role, team: pm.team, status: pm.status, createdAt: pm.createdAt },
    });
  }

  // ─── Invitations en attente pour proj-001 ────────────────────────────────
  const invitations = [
    { id: "inv-001-1", email: "ornella.i@email.com", role: "Membre",     specialty: "Spécialiste contenu", createdAt: new Date("2025-05-12") },
    { id: "inv-001-2", email: "daniel.m@email.com",  role: "Responsable",specialty: "Expert technique",   createdAt: new Date("2025-05-13") },
    { id: "inv-001-3", email: "grace.l@email.com",   role: "Membre",     specialty: "Assistante projet",  createdAt: new Date("2025-05-13") },
  ];
  for (const inv of invitations) {
    await prisma.projectInvitation.upsert({
      where: { id: inv.id },
      update: {},
      create: { id: inv.id, projectId: "proj-001", email: inv.email, role: inv.role, specialty: inv.specialty, status: "pending", invitedByProfileId: "prof-mouandza-demo", createdAt: inv.createdAt },
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

  // ─── Kevin : membre sur d'autres projets + tâches personnelles cross-projets ─
  const kevinExtraProjects = [
    { pid: "proj-005", pmId: "pm-kevin-p005", role: "Ingénieur terrain" },
    { pid: "proj-007", pmId: "pm-kevin-p007", role: "Formateur" },
    { pid: "proj-009", pmId: "pm-kevin-p009", role: "Coordinateur" },
    { pid: "proj-011", pmId: "pm-kevin-p011", role: "Logisticien" },
    { pid: "proj-012", pmId: "pm-kevin-p012", role: "Technicien" },
    { pid: "proj-014", pmId: "pm-kevin-p014", role: "Analyste" },
    { pid: "proj-016", pmId: "pm-kevin-p016", role: "Animateur" },
  ];
  for (const ep of kevinExtraProjects) {
    await prisma.projectMember.upsert({
      where: { id: ep.pmId },
      update: {},
      create: { id: ep.pmId, projectId: ep.pid, profileId: "prof-kevin-demo", role: ep.role },
    });
  }

  const kevinTasks = [
    { id: "task-k-01", title: "Analyser les besoins en énergie solaire",       projectId: "proj-005", status: "in_progress", priority: "high",   dueDate: d(5),   progress: 40,  desc: "Étude des besoins énergétiques des foyers cibles" },
    { id: "task-k-02", title: "Préparer le plan de plantation",                 projectId: "proj-009", status: "todo",        priority: "normal", dueDate: d(10),  progress: 0,   desc: "Définir les espèces et les zones de plantation" },
    { id: "task-k-03", title: "Créer les supports de cours niveau A1",          projectId: "proj-007", status: "in_progress", priority: "high",   dueDate: d(-2),  progress: 65,  desc: "Fiches pédagogiques et exercices d'alphabétisation" },
    { id: "task-k-04", title: "Cartographier les points de collecte plastique", projectId: "proj-014", status: "todo",        priority: "normal", dueDate: d(15),  progress: 0,   desc: "Identifier 10 points stratégiques de collecte" },
    { id: "task-k-05", title: "Planifier le tournoi intercommunal",              projectId: "proj-016", status: "paused",      priority: "normal", dueDate: d(8),   progress: 30,  desc: "Calendrier, règles et équipes participantes" },
    { id: "task-k-06", title: "Sélectionner les ouvrages prioritaires",          projectId: "proj-011", status: "done",        priority: "low",    dueDate: d(-5),  progress: 100, desc: "Choix de 200 titres pour la médiathèque mobile" },
    { id: "task-k-07", title: "Identifier les zones sans eau potable",           projectId: "proj-012", status: "in_progress", priority: "high",   dueDate: d(3),   progress: 55,  desc: "Cartographie des villages non desservis en eau" },
    { id: "task-k-08", title: "Recruter les apprenants adultes",                 projectId: "proj-007", status: "todo",        priority: "low",    dueDate: d(20),  progress: 0,   desc: "Inscrire 40 adultes pour la première session" },
  ];
  for (const t of kevinTasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: { progress: t.progress, status: t.status as any },
      create: {
        id: t.id, title: t.title, description: t.desc,
        profileId: "prof-kevin-demo", projectId: t.projectId,
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

  // ─── Articles ─────────────────────────────────────────────────────────────
  const articles = [
    { id: "art-001", title: "L'éducation numérique : un levier pour l'avenir",                 summary: "Comment le numérique transforme l'accès à l'éducation dans nos communautés.",                         category: "Éducation",    authorId: "prof-kevin-demo",    published: true,  views: 1250, likes: 186, date: "2025-04-30" },
    { id: "art-002", title: "5 actions simples pour protéger notre environnement",              summary: "Des gestes quotidiens qui font une vraie différence pour notre planète.",                             category: "Environnement", authorId: "prof-pauline-demo",  published: true,  views: 980,  likes: 142, date: "2025-04-28" },
    { id: "art-003", title: "Autonomisation des femmes : ensemble, bâtissons le changement",   summary: "Témoignages et initiatives qui transforment des vies.",                                               category: "Société",       authorId: "prof-marie-demo",    published: true,  views: 1560, likes: 234, date: "2025-04-25" },
    { id: "art-004", title: "Énergie solaire : une solution durable pour tous",                 summary: "Focus sur les avantages et les projets en cours dans nos régions.",                                   category: "Innovation",    authorId: "prof-kevin-demo",    published: true,  views: 1100, likes: 168, date: "2025-04-22" },
    { id: "art-005", title: "Pourquoi la participation citoyenne est essentielle",              summary: "Impliquer chaque citoyen pour construire un avenir meilleur.",                                        category: "Engagement",    authorId: "prof-jean-demo",     published: false, views: 0,    likes: 0,   date: "2025-04-18" },
    { id: "art-006", title: "Les jeunes, acteurs clés du développement communautaire",          summary: "Portraits et initiatives portées par la jeunesse locale.",                                            category: "Jeunesse",      authorId: "prof-alain-demo",    published: true,  views: 870,  likes: 123, date: "2025-04-15" },
    { id: "art-007", title: "Microfinance et entrepreneuriat : vers l'autonomie économique",    summary: "Les micro-crédits changent des trajectoires dans les zones rurales.",                                 category: "Innovation",    authorId: "prof-mouandza-demo", published: true,  views: 720,  likes: 98,  date: "2025-04-12" },
    { id: "art-008", title: "Santé communautaire : prévention et sensibilisation",              summary: "Agir en amont pour réduire les maladies évitables dans nos quartiers.",                              category: "Société",       authorId: "prof-sophie-demo",   published: true,  views: 640,  likes: 89,  date: "2025-04-10" },
    { id: "art-009", title: "Reforestation au Gabon : l'urgence d'agir",                        summary: "Un million d'arbres à planter, un objectif national ambitieux.",                                      category: "Environnement", authorId: "prof-pauline-demo",  published: true,  views: 1340, likes: 210, date: "2025-04-08" },
    { id: "art-010", title: "L'alphabétisation des adultes : un enjeu majeur",                  summary: "Réduire l'analphabétisme, c'est ouvrir des portes à des millions de personnes.",                     category: "Éducation",     authorId: "prof-marie-demo",    published: true,  views: 490,  likes: 67,  date: "2025-04-05" },
    { id: "art-011", title: "Inclusion numérique : former pour ne laisser personne de côté",    summary: "Des initiatives pour que le digital profite à tous.",                                                 category: "Innovation",    authorId: "prof-kevin-demo",    published: false, views: 0,    likes: 0,   date: "2025-04-02" },
    { id: "art-012", title: "Sport et valeurs : le football comme outil d'inclusion sociale",   summary: "Comment le sport peut rassembler et transformer des communautés entières.",                           category: "Jeunesse",      authorId: "prof-alain-demo",    published: true,  views: 780,  likes: 104, date: "2025-03-30" },
    { id: "art-013", title: "Coopératives féminines : quand les femmes dirigent",               summary: "Des modèles économiques portés par des femmes et qui font leurs preuves.",                            category: "Société",       authorId: "prof-marie-demo",    published: true,  views: 920,  likes: 145, date: "2025-03-27" },
    { id: "art-014", title: "Agriculture durable : nourrir la population sans épuiser la terre","summary": "Techniques innovantes pour une agriculture respectueuse de l'environnement.",                       category: "Environnement", authorId: "prof-mouandza-demo", published: true,  views: 560,  likes: 82,  date: "2025-03-24" },
    { id: "art-015", title: "Bénévolat : s'engager pour sa communauté",                         summary: "Pourquoi et comment donner de son temps pour une cause qui a du sens.",                               category: "Engagement",    authorId: "prof-jean-demo",     published: true,  views: 430,  likes: 58,  date: "2025-03-20" },
    { id: "art-016", title: "Accès à l'eau potable : des solutions concrètes",                  summary: "Des technologies simples et peu coûteuses pour garantir l'accès à l'eau.",                           category: "Innovation",    authorId: "prof-sophie-demo",   published: true,  views: 690,  likes: 91,  date: "2025-03-17" },
    { id: "art-017", title: "Leadership féminin : briser le plafond de verre au Gabon",         summary: "Des femmes qui prennent leur place dans les instances de décision.",                                  category: "Société",       authorId: "prof-marie-demo",    published: false, views: 0,    likes: 0,   date: "2025-03-14" },
    { id: "art-018", title: "Le recyclage plastique : une opportunité économique locale",        summary: "Transformer les déchets en ressources : des entreprises sociales montrent la voie.",                 category: "Environnement", authorId: "prof-pauline-demo",  published: true,  views: 810,  likes: 117, date: "2025-03-10" },
    { id: "art-019", title: "Former les formateurs : clé de la réplication des savoirs",        summary: "Un investissement dans les compétences humaines qui démultiplie l'impact.",                           category: "Éducation",     authorId: "prof-kevin-demo",    published: true,  views: 380,  likes: 52,  date: "2025-03-07" },
    { id: "art-020", title: "Volontariat international : retours d'expériences",                summary: "Ils ont donné de leur temps à l'étranger et en sont revenus transformés.",                           category: "Engagement",    authorId: "prof-jean-demo",     published: true,  views: 510,  likes: 73,  date: "2025-03-03" },
  ];

  for (const a of articles) {
    await prisma.article.upsert({
      where: { id: a.id },
      update: { views: a.views, likes: a.likes, published: a.published },
      create: {
        id: a.id, title: a.title, summary: a.summary,
        content: `<p>${a.summary}</p><p>Contenu complet de l'article à venir...</p>`,
        category: a.category, published: a.published,
        views: a.views, likes: a.likes,
        authorProfileId: a.authorId,
        date: new Date(a.date), createdAt: new Date(a.date),
      },
    });
  }

  console.log("✓ Seed terminé — 28 projets, 4 stats, 4 documents, 3 événements, 20 articles");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
