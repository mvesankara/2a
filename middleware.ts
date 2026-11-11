import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const redirectToLogin = () => {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("token");
    return response;
  };

  if (!token) {
    return redirectToLogin();
  }

  try {
    await jwtVerify(token, JWT_SECRET);
  } catch {
    return redirectToLogin();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/my-space/:path*", "/dashboard/:path*", "/profil/:path*"],
};
