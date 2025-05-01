'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/Container';
import RecipeCard from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState('grid'); // 'grid' или 'list'

  useEffect(() => {
    // В реальном приложении здесь будет загрузка из API или localStorage
    const savedFavorites = localStorage.getItem('favoriteRecipes');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const removeFromFavorites = (recipeId) => {
    const newFavorites = favorites.filter(recipe => recipe.id !== recipeId);
    setFavorites(newFavorites);
    localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites));
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Избранные рецепты</h1>
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'grid' ? 'default' : 'outline'}
                onClick={() => setView('grid')}
                className="w-10 h-10 p-2"
              >
                □
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                onClick={() => setView('list')}
                className="w-10 h-10 p-2"
              >
                ☰
              </Button>
            </div>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">У вас пока нет избранных рецептов</h2>
              <p className="text-muted-foreground mb-8">
                Добавляйте понравившиеся рецепты в избранное, чтобы быстро находить их позже
              </p>
              <Button onClick={() => window.location.href = '/recommendations'}>
                Найти рецепты
              </Button>
            </div>
          ) : (
            <div className={
              view === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {favorites.map((recipe) => (
                <div key={recipe.id} className="relative group">
                  <RecipeCard recipe={recipe} />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromFavorites(recipe.id)}
                  >
                    Удалить
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
} 