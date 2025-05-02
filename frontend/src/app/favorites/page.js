'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/Container';
import RecipeCard from '@/components/shared/RecipeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'time'
  const [filteredFavorites, setFilteredFavorites] = useState([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteRecipes');
    if (savedFavorites) {
      const parsedFavorites = JSON.parse(savedFavorites);
      // Добавляем дату добавления, если её нет
      const favoritesWithDates = parsedFavorites.map(recipe => ({
        ...recipe,
        dateAdded: recipe.dateAdded || new Date().toISOString()
      }));
      setFavorites(favoritesWithDates);
    }
  }, []);

  useEffect(() => {
    let filtered = [...favorites];

    // Применяем поиск
    if (searchQuery) {
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Применяем сортировку
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'time':
          return parseInt(a.cookingTime) - parseInt(b.cookingTime);
        default:
          return 0;
      }
    });

    setFilteredFavorites(filtered);
  }, [favorites, searchQuery, sortBy]);

  const removeFromFavorites = (recipeId) => {
    const newFavorites = favorites.filter(recipe => recipe.id !== recipeId);
    setFavorites(newFavorites);
    localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites));
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
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

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="w-full md:w-1/2">
                <Input
                  type="search"
                  placeholder="Поиск по названию или описанию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-1/4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="date">По дате добавления</option>
                  <option value="name">По названию</option>
                  <option value="time">По времени приготовления</option>
                </select>
              </div>
            </div>

            {filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                {favorites.length === 0 ? (
                  <>
                    <h2 className="text-2xl font-bold mb-4">У вас пока нет избранных рецептов</h2>
                    <p className="text-muted-foreground mb-8">
                      Добавляйте понравившиеся рецепты в избранное, чтобы быстро находить их позже
                    </p>
                    <Button onClick={() => window.location.href = '/recommendations'}>
                      Найти рецепты
                    </Button>
                  </>
                ) : (
                  <p className="text-xl text-muted-foreground">
                    По вашему запросу ничего не найдено
                  </p>
                )}
              </div>
            ) : (
              <div className={
                view === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {filteredFavorites.map((recipe) => (
                  <div key={recipe.id} className="relative group">
                    <RecipeCard 
                      recipe={recipe}
                      className={view === 'list' ? 'flex flex-row items-center gap-4' : ''}
                    />
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
        </div>
      </Container>
    </div>
  );
} 