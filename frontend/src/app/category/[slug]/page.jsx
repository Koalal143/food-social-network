import { useState } from 'react';
import Container from '@/components/Container';
import RecipeCard from '@/components/RecipeCard';
import RecipeFilters from '@/components/RecipeFilters';

// Временные данные для демонстрации
const categoryData = {
  breakfast: {
    title: 'Завтрак',
    description: 'Вкусные и полезные рецепты для идеального начала дня',
    recipes: [
      {
        id: 1,
        title: 'Запеканка из овсяных хлопьев с арахисом и изюмом',
        description: 'Вкусная, нежная и сытная запеканка.',
        image: '/images/recipes/oatmeal.jpg',
        cookingTime: '1 ч 10 м',
        difficulty: 'Легко',
      },
      {
        id: 2,
        title: 'Омлет с овощами',
        description: 'Легкий и питательный завтрак с сезонными овощами.',
        image: '/images/recipes/omelet.jpg',
        cookingTime: '15 минут',
        difficulty: 'Легко',
      },
      // Добавьте больше рецептов
    ],
  },
  // Добавьте больше категорий
};

export default function CategoryPage({ params }) {
  const category = categoryData[params.slug] || {
    title: 'Категория не найдена',
    description: 'К сожалению, данная категория не существует',
    recipes: [],
  };

  const [filteredRecipes, setFilteredRecipes] = useState(category.recipes);

  const handleFilterChange = (filters) => {
    let filtered = [...category.recipes];

    if (filters.cookingTime !== 'all') {
      filtered = filtered.filter((recipe) => {
        const time = parseInt(recipe.cookingTime);
        switch (filters.cookingTime) {
          case 'quick':
            return time <= 30;
          case 'medium':
            return time > 30 && time <= 60;
          case 'long':
            return time > 60;
          default:
            return true;
        }
      });
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter((recipe) => recipe.difficulty === filters.difficulty);
    }

    setFilteredRecipes(filtered);
  };

  return (
    <div className="py-8">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{category.title}</h1>
          <p className="text-lg text-muted-foreground mb-8">{category.description}</p>

          <RecipeFilters onFilterChange={handleFilterChange} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                По выбранным фильтрам рецептов не найдено
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
} 