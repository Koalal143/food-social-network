import { NextResponse } from 'next/server';

const ADMIN_SECRET_PATH = '/system-management-panel';
const adminRoutes = [
  ADMIN_SECRET_PATH,
  `${ADMIN_SECRET_PATH}/users`,
  `${ADMIN_SECRET_PATH}/recipes`,
  `${ADMIN_SECRET_PATH}/test`,
  `${ADMIN_SECRET_PATH}/complaints`,
  `${ADMIN_SECRET_PATH}/reports`,
  `${ADMIN_SECRET_PATH}/banned-domains`,
  `${ADMIN_SECRET_PATH}/banned-emails`,
  `${ADMIN_SECRET_PATH}/info`,
  `${ADMIN_SECRET_PATH}/test-improvements`
];
const BASE_API = process.env.NEXT_PUBLIC_INTERNAL_API_URL;

async function return404Page(req) {
  const url = req.nextUrl.clone();
  url.pathname = '/not-found';
  return NextResponse.rewrite(url);
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    console.log(`[MIDDLEWARE] Admin route accessed: ${pathname}`);
    const accessTokenCookie = req.cookies.get('access_token');

    if (!accessTokenCookie) {
      console.log('[MIDDLEWARE] No access token found');
      return return404Page(req);
    }

    try {
      console.log(`[MIDDLEWARE] Making request to: ${BASE_API}/v1/users/me`);
      const response = await fetch(`${BASE_API}/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${accessTokenCookie.value}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`[MIDDLEWARE] Response status: ${response.status}`);
      if (!response.ok) {
        console.log('[MIDDLEWARE] Response not ok');
        return return404Page(req);
      }

      const userData = await response.json();
      console.log('[MIDDLEWARE] User data:', userData);
      console.log('[MIDDLEWARE] is_superuser:', userData?.is_superuser);

      if (!userData?.is_superuser) {
        console.log('[MIDDLEWARE] User is not superuser');
        return return404Page(req);
      }

      console.log('[MIDDLEWARE] Access granted');
      return NextResponse.next();
    } catch (error) {
      console.log('[MIDDLEWARE] Error:', error);
      return return404Page(req);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/system-management-panel/:path*', '/system-management-panel'],
};
