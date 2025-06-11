import { NextResponse } from 'next/server';

// Используем скрытый роут для админки для безопасности
const ADMIN_SECRET_PATH = '/system-management-panel';
const adminRoutes = [
  ADMIN_SECRET_PATH,
  `${ADMIN_SECRET_PATH}/users`,
  `${ADMIN_SECRET_PATH}/recipes`,
  `${ADMIN_SECRET_PATH}/test`
];
const BASE_API = process.env.FRONTEND__API__URL;

async function return404Page(req) {
  // Создаем rewrite на страницу not-found, которая автоматически возвращает статус 404
  const url = req.nextUrl.clone();
  url.pathname = '/not-found';
  return NextResponse.rewrite(url);
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Проверяем, является ли запрос админским роутом
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    // Получаем токен из cookies
    const accessTokenCookie = req.cookies.get('access_token');

    if (!accessTokenCookie) {
      // Если нет токена, показываем обычную страницу 404
      return return404Page(req);
    }

    try {
      // Проверяем токен и права пользователя через API бэкенда
      const response = await fetch(`${BASE_API}/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${accessTokenCookie.value}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Если токен недействителен, показываем обычную страницу 404
        return return404Page(req);
      }

      const userData = await response.json();

      // Проверяем, является ли пользователь суперпользователем
      if (!userData?.is_superuser) {
        // Если не суперпользователь, показываем обычную страницу 404
        return return404Page(req);
      }

      // Если все проверки пройдены (токен валиден + пользователь суперпользователь), разрешаем доступ
      return NextResponse.next();
    } catch (error) {
      console.error('Ошибка при проверке пользователя в middleware:', error);
      // В случае ошибки показываем обычную страницу 404
      return return404Page(req);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/system-management-panel/:path*', '/system-management-panel'],
};
