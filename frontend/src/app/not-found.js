"use client";

import Link from 'next/link';
import Container from '@/components/layout/Container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, ChefHat, ArrowLeft, Cookie } from 'lucide-react';

export default function NotFound() {
  return (
    <Container className="min-h-[80vh] flex items-center justify-center py-8">
      <Card className="w-full max-w-2xl shadow-lg border-0 bg-gradient-to-br from-background to-muted/20 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
        <CardContent className="p-8 md:p-12 text-center">
          {/* Большая цифра 404 */}
          <div className="mb-8 animate-in fade-in-50 slide-in-from-top-4 duration-1000 delay-200">
            <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text leading-none animate-pulse">
              404
            </h1>
          </div>

          {/* Иконка и заголовок */}
          <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000 delay-400">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors duration-300">
              <ChefHat className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Страница не найдена
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              К сожалению, запрашиваемая вами страница не существует или была перемещена.
              Возможно, вы ошиблись в адресе или страница была удалена.
            </p>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in-50 slide-in-from-bottom-4 duration-1000 delay-600">
            <Button asChild size="lg" className="w-full sm:w-auto hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl">
              <Link href="/" className="flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Главная страница
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl">
              <Link href="/search" className="flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Поиск рецептов
              </Link>
            </Button>
          </div>

          {/* Дополнительная навигация */}
          <div className="mt-8 pt-6 border-t border-border/50 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000 delay-800">
            <p className="text-sm text-muted-foreground mb-4">
              Или попробуйте эти популярные разделы:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button asChild variant="ghost" size="sm" className="hover:scale-105 transition-transform duration-200">
                <Link href="/recommendations">
                  Рекомендации
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hover:scale-105 transition-transform duration-200">
                <Link href="/profile">
                  Профиль
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hover:scale-105 transition-transform duration-200">
                <Link href="/recipe/add">
                  Добавить рецепт
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hover:scale-105 transition-transform duration-200">
                <Link href="/docs/cookies" className="flex items-center">
                  <Cookie className="w-3 h-3 mr-1" />
                  Управление куки
                </Link>
              </Button>
            </div>
          </div>

          {/* Кнопка "Назад" */}
          <div className="mt-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000 delay-1000">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться назад
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}