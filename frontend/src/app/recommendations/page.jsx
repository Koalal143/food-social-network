'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import RecipeSwipeCard from '@/components/RecipeSwipeCard';
import { Button } from '@/components/ui/button';

// Временные данные для демонстрации
const recommendedRecipes = [
  {
    id: 1,
    title: 'Паста Карбонара',
    description: 'Классическая итальянская паста с беконом, яйцами и сыром пармезан',
    image: '/images/recipes/carbonara.jpg',
    cookingTime: '30 минут',
    difficulty: 'Средне',
  },
  {
    id: 2,
    title: 'Тыквенный суп',
    description: 'Нежный крем-суп из тыквы со сливками и специями',
    image: '/images/recipes/pumpkin-soup.jpg',
    cookingTime: '45 минут',
    difficulty: 'Легко',
  },
  {
    id: 3,
    title: 'Шоколадный фондан',
    description: 'Восхитительный десерт с жидкой шоколадной начинкой',
    image: '/images/recipes/fondant.jpg',
    cookingTime: '20 минут',
    difficulty: 'Сложно',
  },
  {
    id: 4,
    title: 'Греческий салат',
    description: 'Свежий салат с огурцами, помидорами, оливками и сыром фета',
    image: '/images/recipes/greek-salad.jpg',
    cookingTime: '15 минут',
    difficulty: 'Легко',
  },
  {
    id: 5,
    title: 'Борщ',
    description: 'Традиционный украинский борщ со сметаной и чесночными пампушками',
    image: '/images/recipes/borsch.jpg',
    cookingTime: '2 часа',
    difficulty: 'Средне',
  },
  // Добавьте больше рецептов
];

export default function RecommendationsPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedRecipes, setLikedRecipes] = useState([]);

  useEffect(() => {
    // Загружаем сохраненные рецепты при монтировании компонента
    const savedRecipes = localStorage.getItem('favoriteRecipes');
    if (savedRecipes) {
      setLikedRecipes(JSON.parse(savedRecipes));
    }
  }, []);

  const currentRecipe = recommendedRecipes[currentIndex];

  const handleLike = (recipe) => {
    const newLikedRecipes = [...likedRecipes, recipe];
    setLikedRecipes(newLikedRecipes);
    // Сохраняем в localStorage
    localStorage.setItem('favoriteRecipes', JSON.stringify(newLikedRecipes));
    showNextRecipe();
  };

  const handleDislike = () => {
    showNextRecipe();
  };

  const showNextRecipe = () => {
    if (currentIndex < recommendedRecipes.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
    }
  };

  const handleViewRecipe = (recipe) => {
    router.push(`/recipe/${recipe.id}`);
  };

  const handleViewFavorites = () => {
    router.push('/favorites');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <Container>
        <div className="max-w-4xl mx-auto">
          {currentIndex < recommendedRecipes.length ? (
            <>
              <Button 
                onClick={handleViewFavorites} 
                variant="outline" 
                className="absolute top-6 right-6 z-10"
              >
                ♥ {likedRecipes.length}
              </Button>
              <RecipeSwipeCard
                recipe={currentRecipe}
                onLike={handleLike}
                onDislike={handleDislike}
                onViewRecipe={handleViewRecipe}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Рецепты закончились!</h2>
              <p className="text-muted-foreground mb-8">
                Вы просмотрели все доступные рецепты. Понравилось {likedRecipes.length} рецептов.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setCurrentIndex(0)} variant="outline">
                  Начать сначала
                </Button>
                <Button onClick={handleViewFavorites}>
                  Перейти в избранное
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
} 