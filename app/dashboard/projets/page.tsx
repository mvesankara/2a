import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProjectsPage from "@/components/projects/ProjectsPage";

export const metadata = { title: "Projets – 2A Acteurs de l'Avenir" };

export default async function ProjetsRoute() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login?redirect=/dashboard/projets");

  let payload: { userId: string; email: string };
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login?redirect=/dashboard/projets");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true, role: true, id: true } } },
  });
  if (!user?.profile) redirect("/login");

  const unreadCount = await prisma.notification.count({
    where: { userId: user.profile.id, isRead: false },
  });

  const headerProfile = {
    firstName:  user.profile.firstName,
    lastName:   user.profile.lastName,
    avatarUrl:  user.profile.avatarUrl,
    role:       user.profile.role,
  };

  return (
    <>
      <DashboardHeader unreadCount={unreadCount} profile={headerProfile} />
      <main className="flex-1 overflow-y-auto p-6">
        <ProjectsPage />
      </main>
    </>
  );
}
