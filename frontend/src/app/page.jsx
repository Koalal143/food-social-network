import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RecipeCategories from '@/components/RecipeCategories';
import RecipeGrid from '@/components/RecipeGrid';

// Временные данные для демонстрации
const featuredRecipes = [
  {
    id: 1,
    title: 'Запеканка из овсяных хлопьев с арахисом и изюмом',
    description: 'Вкусная, нежная и сытная запеканка.',
    image: '/images/recipes/oatmeal.jpg',
    cookingTime: '1 ч 10 м',
  },
  {
    id: 2,
    title: 'Цитрусовый лимонад',
    description: 'Необыкновенно вкусный и очень полезный натуральный лимонад из свежих цитрусов.',
    image: '/images/recipes/lemonade.jpg',
    cookingTime: '12 минут',
  },
  // Добавьте больше рецептов по необходимости
];

const videoRecipes = [
  {
    id: 1,
    title: 'Куриные биточки с фасолью и овощами',
    description: 'Ароматные и очень сытные биточки с гарниром.',
    image: '/images/recipes/chicken.jpg',
    cookingTime: '1 ч',
  },
  // Добавьте больше видео-рецептов
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <RecipeCategories />
        <RecipeGrid 
          title="Ваши лучшие рецепты" 
          recipes={featuredRecipes} 
          showMoreLink={true}
        />
        <RecipeGrid 
          title="Видеорецепты" 
          recipes={videoRecipes} 
          showMoreLink={true}
        />
      </main>
      <Footer />
    </div>
  );
} 