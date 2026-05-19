import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import { requireAuthApi } from "@/lib/auth-middleware";

export async function POST(request: NextRequest) {
  return requireAuthApi(request, async (req, { userId }) => {
    const formData = await req.formData();
    const profilePhoto = formData.get("profilePhoto") as File | null;
    const idDocument = formData.get("idDocument") as File | null;

    const updates: Record<string, string> = {};

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (profilePhoto && profilePhoto.type.startsWith("image/")) {
      const ext = path.extname(profilePhoto.name) || ".jpg";
      const filename = `${userId}-avatar${ext}`;
      await mkdir(path.join(uploadDir, "avatars"), { recursive: true });
      await writeFile(path.join(uploadDir, "avatars", filename), Buffer.from(await profilePhoto.arrayBuffer()));
      updates.avatarUrl = `/uploads/avatars/${filename}`;
    }

    if (idDocument) {
      const ext = path.extname(idDocument.name) || ".pdf";
      const filename = `${userId}-id${ext}`;
      await mkdir(path.join(uploadDir, "documents"), { recursive: true });
      await writeFile(path.join(uploadDir, "documents", filename), Buffer.from(await idDocument.arrayBuffer()));
      updates.idDocumentUrl = `/uploads/documents/${filename}`;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.profile.update({ where: { userId }, data: updates });
    }

    return NextResponse.json({ message: "Documents enregistrés." });
  });
}
