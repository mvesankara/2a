import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return requireAuthApi(request, async (req, { userId }) => {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true, role: true } });
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

    const isAuthor = article.authorProfileId === profile.id;
    const isAdmin  = profile.role === "administrateur";
    if (!isAuthor && !isAdmin) return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });

    const form = await req.formData().catch(() => null);
    const file = form?.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "Aucune image fournie" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const dir = path.join(process.cwd(), "public", "uploads", "articles");
    await mkdir(dir, { recursive: true });
    const filename = `${id}.${ext}`;
    await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

    const imageUrl = `/uploads/articles/${filename}`;
    await prisma.article.update({ where: { id }, data: { imageUrl } });

    return NextResponse.json({ imageUrl });
  });
}
