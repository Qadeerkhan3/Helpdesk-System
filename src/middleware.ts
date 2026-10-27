import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect dashboard routes (Example: /dashboard/admin, /dashboard/agent, /dashboard/student)
  // For production, token cookies can be verified here.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/tickets/:path*'],
};