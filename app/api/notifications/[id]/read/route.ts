import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return requireAuthApi(request, async (_req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    const notification = await prisma.notification.findFirst({
      where: { id, userId: profile.id },
    });
    if (!notification) {
      return NextResponse.json({ error: "Notification introuvable" }, { status: 404 });
    }

    const updated = await prisma.notification.update({ where: { id }, data: { isRead: true } });
    return NextResponse.json(updated);
  });
}
