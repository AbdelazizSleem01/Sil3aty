import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const rateLimitMap = new Map();
const MAX_REQUESTS = 100;
const WINDOW_SIZE = 15 * 60 * 1000;
const BLOCK_DURATION = 15 * 60 * 1000;

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

function isRateLimited(ip) {
  const now = Date.now();
  const windowStart = now - WINDOW_SIZE;
  if (!rateLimitMap.has(ip)) rateLimitMap.set(ip, []);
  const requests = rateLimitMap.get(ip);
  const validRequests = requests.filter(time => time > windowStart);
  if (validRequests.length >= MAX_REQUESTS) return true;
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  return false;
}

function isBlocked(ip) {
  const blockedData = rateLimitMap.get(`blocked_${ip}`);
  if (!blockedData) return false;
  const { blockedUntil } = blockedData;
  if (Date.now() > blockedUntil) {
    rateLimitMap.delete(`blocked_${ip}`);
    return false;
  }
  return true;
}

function blockIP(ip) {
  const blockedUntil = Date.now() + BLOCK_DURATION;
  rateLimitMap.set(`blocked_${ip}`, { blockedUntil });
}

export async function middleware(req) {
  const ip = req.ip || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const pathname = req.nextUrl.pathname;

  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (pathname.includes('/admin')) {
    if (isBlocked(ip)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Access blocked due to excessive requests',
          retryAfter: Math.ceil(BLOCK_DURATION / 1000 / 60),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(BLOCK_DURATION / 1000).toString(),
            ...securityHeaders,
          },
        }
      );
    }

    if (isRateLimited(ip)) {
      blockIP(ip);
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Access temporarily blocked.',
          retryAfter: Math.ceil(BLOCK_DURATION / 1000 / 60),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(BLOCK_DURATION / 1000).toString(),
            ...securityHeaders,
          },
        }
      );
    }

    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

      if (!token)
        return NextResponse.redirect(new URL('/login?error=AccessDenied', req.url));

      if (token.exp && Date.now() >= token.exp * 1000)
        return NextResponse.redirect(new URL('/login?error=SessionExpired', req.url));

      if (!token.id || !token.email)
        return NextResponse.redirect(new URL('/login?error=InvalidToken', req.url));

      if (!token.isAdmin)
        return NextResponse.redirect(new URL('/unauthorized', req.url));

      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    } catch {
      return NextResponse.redirect(new URL('/login?error=SystemError', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
