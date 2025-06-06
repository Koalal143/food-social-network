import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Секретный ключ для проверки JWT (замените на свой)
const secret = process.env.JWT_SECRET;

// Список маршрутов, требующих аутентификации администратора
const adminRoutes = ['/admin', '/admin/users', '/admin/recipes', '/admin/test'];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Проверяем, является ли маршрут админским
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const token = req.cookies.get('token')?.value;

    // Если токен отсутствует, возвращаем 404
    if (!token) {
      console.log('Нет токена, возвращаем 404');
      return NextResponse.rewrite(new URL('/not-found', req.url));
    }

    try {
      // Проверяем токен
      const verified = await jwtVerify(token, new TextEncoder().encode(secret));

      // Проверяем, является ли пользователь суперпользователем
      const isSuperuser = verified.payload?.is_superuser;

      // Если пользователь не является суперпользователем, возвращаем 404
      if (!isSuperuser !== true) {
        console.log('Пользователь не суперпользователь, возвращаем 404');
        return NextResponse.rewrite(new URL('/not-found', req.url));
      }

      // Если все проверки пройдены, продолжаем выполнение запроса
      return NextResponse.next();
    } catch (error) {
      console.error('Ошибка проверки токена:', error);
      // Если токен недействителен, возвращаем 404
      return NextResponse.rewrite(new URL('/not-found', req.url));
    }
  }

  // Для всех остальных маршрутов продолжаем выполнение запроса
  return NextResponse.next();
}

// Конфигурация middleware: указываем, для каких маршрутов он должен выполняться
export const config = {
  matcher: ['/admin/:path*', '/admin',]
};
