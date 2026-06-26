import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

// ─── GET: Liste des tâches d'un projet ───────────────────────────────────────

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);

  const search    = searchParams.get("search")    ?? "";
  const status    = searchParams.get("status")    ?? "";
  const priority  = searchParams.get("priority")  ?? "";
  const profileId = searchParams.get("profileId") ?? "";
  const sort      = searchParams.get("sort")      ?? "recent";
  const page      = Math.max(1, Number(searchParams.get("page")    ?? "1"));
  const perPage   = Math.min(50, Math.max(1, Number(searchParams.get("perPage") ?? "6")));

  const now = new Date();

  // Stats globales (non filtrées)
  const allTasks = await prisma.task.findMany({
    where: { projectId: id },
    select: { status: true, isBlocked: true, dueDate: true },
  });

  const stats = {
    total:      allTasks.length,
    done:       allTasks.filter((t) => t.status === "done" || t.status === "review").length,
    inProgress: allTasks.filter((t) => t.status === "in_progress").length,
    pending:    allTasks.filter((t) => t.status === "todo" && !t.isBlocked).length,
    overdue:    allTasks.filter((t) =>
      (t.status === "todo" || t.status === "in_progress") &&
      t.dueDate != null && new Date(t.dueDate) < now
    ).length,
    blocked:    allTasks.filter((t) => t.isBlocked).length,
  };

  // Clause where filtrée
  const where: Parameters<typeof prisma.task.findMany>[0]["where"] = { projectId: id };

  if (search) where.OR = [
    { title:       { contains: search, mode: "insensitive" } },
    { description: { contains: search, mode: "insensitive" } },
  ];
  if (profileId) where.profileId = profileId;

  // Filtre statut (incluant "retard" et "bloquee" qui sont calculés)
  if (status === "terminee") {
    where.status = { in: ["done", "review"] };
  } else if (status === "en_cours") {
    where.status = "in_progress";
    where.isBlocked = false;
  } else if (status === "en_attente") {
    where.status = "todo";
    where.isBlocked = false;
  } else if (status === "retard") {
    where.status = { in: ["todo", "in_progress"] };
    where.dueDate = { lt: now };
    where.isBlocked = false;
  } else if (status === "bloquee") {
    where.isBlocked = true;
  }

  // Filtre priorité
  if (priority === "high")   where.priority = "high";
  if (priority === "normal") where.priority = { in: ["normal", null] };
  if (priority === "low")    where.priority = "low";

  const total = await prisma.task.count({ where });

  const orderBy: Parameters<typeof prisma.task.findMany>[0]["orderBy"] =
    sort === "oldest"   ? { createdAt: "asc" }  :
    sort === "dueDate"  ? { dueDate:   "asc" }  :
    sort === "priority" ? { priority:  "desc" } :
    sort === "progress" ? { progress:  "desc" } :
    { createdAt: "desc" };

  const tasks = await prisma.task.findMany({
    where,
    orderBy,
    skip: (page - 1) * perPage,
    take: perPage,
    include: {
      profile: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  });

  // Membres du projet pour le dropdown d'assignation
  const members = await prisma.projectMember.findMany({
    where: { projectId: id },
    include: { profile: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Associer le rôle projet à chaque tâche
  const roleMap = new Map(members.map((m) => [m.profileId, m.role]));
  const tasksWithRole = tasks.map((t) => ({
    ...t,
    projectRole: t.profileId ? (roleMap.get(t.profileId) ?? null) : null,
    dueDate: t.dueDate?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return NextResponse.json({ tasks: tasksWithRole, total, page, perPage, stats, members });
}

// ─── POST: Créer une tâche pour le projet ────────────────────────────────────

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return requireAuthApi(request, async (req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const isMember = await prisma.projectMember.findFirst({ where: { projectId: id, profileId: profile.id } });
    const isAdmin  = profile.role === "administrateur";
    if (!isMember && !isAdmin) return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { title, description, assignedProfileId, status, priority, dueDate, progress } = body;

    if (!title?.trim()) return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });

    const task = await prisma.task.create({
      data: {
        title:       title.trim(),
        description: description?.trim() || null,
        profileId:   assignedProfileId || null,
        projectId:   id,
        status:      (status as any) || "todo",
        priority:    priority || "normal",
        dueDate:     dueDate ? new Date(dueDate) : null,
        progress:    progress != null ? Math.min(100, Math.max(0, Number(progress))) : 0,
      },
      include: {
        profile: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    const members = await prisma.projectMember.findMany({ where: { projectId: id } });
    const roleMap = new Map(members.map((m) => [m.profileId, m.role]));

    return NextResponse.json({
      ...task,
      projectRole: task.profileId ? (roleMap.get(task.profileId) ?? null) : null,
      dueDate: task.dueDate?.toISOString() ?? null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }, { status: 201 });
  });
}
