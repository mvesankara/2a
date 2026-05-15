import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";

export function getUserFromRequest(request: NextRequest): { userId: string; email: string } | null {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuthApi(
  request: NextRequest,
  handler: (req: NextRequest, user: { userId: string; email: string }) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = getUserFromRequest(request);
  if (!user) {
    return Promise.resolve(NextResponse.json({ error: "Non authentifié" }, { status: 401 }));
  }
  return handler(request, user);
}
