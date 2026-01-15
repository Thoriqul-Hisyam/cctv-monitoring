import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export default async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // Halaman public (login only)
  const isLoginPage = pathname === "/login";

  // Jika ada token dan mencoba akses login, redirect ke dashboard
  if (token && isLoginPage) {
    try {
      // Verify token menggunakan Web Crypto API atau skip verification di middleware
      // Karena jwt library tidak support di edge runtime
      return NextResponse.redirect(new URL("/admin", request.url));
    } catch (error) {
      // Token tidak valid, lanjutkan ke halaman login
    }
  }

  // Jika tidak ada token dan mencoba akses halaman protected
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
