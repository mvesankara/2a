import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import NewArticlePage from "@/components/articles/NewArticlePage";

export const metadata = { title: "Nouvel article – 2A" };

export default async function NouvelArticleRoute() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login?redirect=/dashboard/articles/nouveau");

  let payload: { userId: string; email: string };
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login?redirect=/dashboard/articles/nouveau");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      profile: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
    },
  });
  if (!user?.profile) redirect("/login");

  const [unreadCount, categories] = await Promise.all([
    prisma.notification.count({ where: { userId: user.profile.id, isRead: false } }),
    prisma.article.findMany({ select: { category: true }, distinct: ["category"] }).then(
      rows => rows.map(r => r.category).filter(Boolean) as string[]
    ),
  ]);

  const breadcrumb = [
    { label: "Articles", href: "/dashboard/articles" },
    { label: "Nouveau article" },
  ];

  return (
    <>
      <DashboardHeader unreadCount={unreadCount} profile={user.profile} breadcrumb={breadcrumb} />
      <main className="flex-1 overflow-y-auto p-6">
        <NewArticlePage categories={categories} />
      </main>
    </>
  );
}
