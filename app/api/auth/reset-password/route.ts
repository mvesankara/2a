import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  return NextResponse.json({ message: "Si cet email existe, un lien de réinitialisation a été envoyé." });
}
