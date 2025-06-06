import { NextResponse } from 'next/server';
import AuthService from '@/services/auth.service';

const adminRoutes = ['/admin', '/admin/users', '/admin/recipes', '/admin/test'];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.rewrite(new URL('/not-found', req.url));
    }

    try {
      const userData = await AuthService.getCurrentUser();

      const isSuperuser = userData?.is_superuser;

      if (!isSuperuser) {
        console.log('Пользователь не суперпользователь');
        return NextResponse.rewrite(new URL('/not-found', req.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Ошибка при проверке пользователя:', error);
      return NextResponse.rewrite(new URL('/not-found', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
