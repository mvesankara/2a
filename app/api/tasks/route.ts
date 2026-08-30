import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  projectId: z.string().optional().nullable(),
  priority: z.enum(["low", "normal", "high"]).optional().default("normal"),
});

export async function GET(request: NextRequest) {
  return requireAuthApi(request, async (_req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) return NextResponse.json({ tasks: [], stats: {}, upcomingDeadlines: [], projectsDistribution: [], myProjects: [] });

    const { searchParams } = request.nextUrl;
    const tab       = searchParams.get("tab") ?? "all";       // all | todo | in_progress | paused | done | overdue
    const status    = searchParams.get("status");
    const priority  = searchParams.get("priority");
    const projectId = searchParams.get("projectId");
    const search    = searchParams.get("search") ?? "";
    const sortBy    = searchParams.get("sortBy") ?? "dueDate";
    const page      = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit     = Math.min(50, Math.max(5, parseInt(searchParams.get("limit") ?? "20", 10)));

    const now = new Date();

    // Base where clause
    const baseWhere: Parameters<typeof prisma.task.findMany>[0]["where"] = {
      profileId: profile.id,
    };

    // Tab filter
    if (tab === "overdue") {
      baseWhere.dueDate = { lt: now };
      baseWhere.status = { notIn: ["done", "review"] };
    } else if (tab === "done") {
      baseWhere.status = { in: ["done", "review"] };
    } else if (tab !== "all" && ["todo", "in_progress", "paused"].includes(tab)) {
      baseWhere.status = tab as "todo" | "in_progress" | "paused";
    }

    // Additional filters (override tab if explicit)
    if (status) baseWhere.status = status as "todo" | "in_progress" | "paused" | "done" | "review";
    if (priority) baseWhere.priority = priority;
    if (projectId) baseWhere.projectId = projectId;
    if (search) {
      baseWhere.title = { contains: search, mode: "insensitive" };
    }

    // Count for stats (all tasks, ignore filters)
    const [allTasks, filteredCount] = await Promise.all([
      prisma.task.findMany({
        where: { profileId: profile.id },
        select: { id: true, status: true, dueDate: true, priority: true, projectId: true, project: { select: { id: true, name: true } } },
      }),
      prisma.task.count({ where: baseWhere }),
    ]);

    // Compute stats
    const total      = allTasks.length;
    const done       = allTasks.filter(t => t.status === "done" || t.status === "review").length;
    const inProgress = allTasks.filter(t => t.status === "in_progress").length;
    const todo       = allTasks.filter(t => t.status === "todo").length;
    const paused     = allTasks.filter(t => t.status === "paused").length;
    const overdue    = allTasks.filter(t =>
      t.dueDate && t.dueDate < now && t.status !== "done" && t.status !== "review"
    ).length;

    // Projects distribution
    const projectMap = new Map<string, { id: string; name: string; count: number }>();
    for (const t of allTasks) {
      if (t.project) {
        const key = t.project.id;
        if (!projectMap.has(key)) projectMap.set(key, { id: t.project.id, name: t.project.name, count: 0 });
        projectMap.get(key)!.count++;
      }
    }
    const projectsDistribution = Array.from(projectMap.values()).sort((a, b) => b.count - a.count);

    // My projects (distinct projects with at least 1 task)
    const myProjects = projectsDistribution.map(p => ({ id: p.id, name: p.name }));

    // Upcoming deadlines (next 7 days, not done)
    const in7days = new Date(now);
    in7days.setDate(in7days.getDate() + 7);
    const upcomingDeadlines = allTasks
      .filter(t => t.dueDate && t.dueDate >= now && t.dueDate <= in7days && t.status !== "done" && t.status !== "review")
      .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
      .slice(0, 5)
      .map(t => ({ id: t.id, dueDate: t.dueDate, projectName: t.project?.name ?? null, status: t.status, priority: t.priority }));

    // Fetch paginated tasks
    const orderMap: Record<string, Parameters<typeof prisma.task.findMany>[0]["orderBy"]> = {
      dueDate:   [{ dueDate: "asc" }, { createdAt: "desc" }],
      priority:  [{ priority: "desc" }, { dueDate: "asc" }],
      title:     [{ title: "asc" }],
      createdAt: [{ createdAt: "desc" }],
    };

    const tasks = await prisma.task.findMany({
      where: baseWhere,
      include: { project: { select: { id: true, name: true } } },
      orderBy: orderMap[sortBy] ?? orderMap.dueDate,
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      tasks,
      pagination: { page, limit, total: filteredCount, pages: Math.ceil(filteredCount / limit) },
      stats: { total, done, inProgress, todo, paused, overdue },
      upcomingDeadlines,
      projectsDistribution,
      myProjects,
    });
  });
}

export async function POST(request: NextRequest) {
  return requireAuthApi(request, async (req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const { dueDate, title, description, projectId, priority } = parsed.data;

    const task = await prisma.task.create({
      data: {
        title,
        ...(description !== undefined && { description }),
        ...(projectId !== undefined && projectId !== null && { projectId }),
        ...(priority !== undefined && { priority }),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        profileId: profile.id,
      },
      include: { project: { select: { id: true, name: true } } },
    });

    return NextResponse.json(task, { status: 201 });
  });
}
