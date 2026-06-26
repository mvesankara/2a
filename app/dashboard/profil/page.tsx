import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProfilPage from "@/components/personal-space/ProfilPage";

export const metadata = { title: "Profil – 2A Acteurs de l'Avenir" };

export default async function ProfilRoute() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login?redirect=/dashboard/profil");

  let payload: { userId: string; email: string };
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login?redirect=/dashboard/profil");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { profile: true },
  });
  if (!user?.profile) redirect("/login");

  const profile = user.profile;

  const [projectMembers, tasksCompleted, articlesPublished, eventsParticipated, notifications] =
    await Promise.all([
      prisma.projectMember.count({ where: { profileId: profile.id } }),
      prisma.task.count({ where: { profileId: profile.id, status: "done" } }),
      prisma.article.count({ where: { userId: payload.userId, published: true } }),
      prisma.eventParticipant.count({ where: { profileId: profile.id } }),
      prisma.notification.count({ where: { userId: profile.id, isRead: false } }),
    ]);

  const data = {
    profile: {
      id: profile.id,
      userId: payload.userId,
      email: profile.email ?? user.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      city: profile.city,
      country: profile.country,
      address: profile.address,
      phone: profile.phone,
      gender: profile.gender,
      dateOfBirth: profile.dateOfBirth?.toISOString() ?? null,
      personalDescription: profile.personalDescription,
      profession: profile.profession,
      organization: profile.organization,
      motivation: profile.motivation,
      skills: profile.skills,
      interests: profile.interests,
      associationContribution: profile.associationContribution,
      role: profile.role,
      status: profile.status,
      membershipType: profile.membershipType,
      membershipExpiresAt: profile.membershipExpiresAt?.toISOString() ?? null,
      createdAt: profile.createdAt.toISOString(),
    },
    stats: {
      projectsCount: projectMembers,
      tasksCompleted,
      articlesPublished,
      eventsParticipated,
    },
    unreadCount: notifications,
  };

  return (
    <>
      <DashboardHeader unreadCount={data.unreadCount} profile={data.profile} />
      <main className="flex-1 overflow-y-auto p-6">
        <ProfilPage data={data} />
      </main>
    </>
  );
}
