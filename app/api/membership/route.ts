import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string().min(1),
  gender: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  password: z.string().min(8),
  membershipType: z.enum(["adherent", "sympathisant"]),
  motivation: z.string().optional(),
  howDidYouHear: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const {
    firstName, lastName, dateOfBirth, gender, country, city, address, phone,
    email, password, membershipType, motivation, howDidYouHear,
  } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      profile: {
        create: {
          email,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          country,
          city,
          address,
          phone,
          motivation: motivation ?? null,
          howDidYouHear: howDidYouHear ?? null,
          role: membershipType,
          status: "pending",
        },
      },
    },
    include: { profile: true },
  });

  const token = signToken({ userId: user.id, email: user.email });

  const response = NextResponse.json(
    {
      token,
      user: { id: user.id, email: user.email },
      profile: user.profile,
      message: "Votre demande d'adhésion a été soumise avec succès.",
    },
    { status: 201 }
  );

  response.cookies.set("token", token, {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
