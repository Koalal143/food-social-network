'use client';
import { useState, useEffect } from 'react';
import Container from "@/components/layout/Container";
import RecipeSwipeCard from "@/components/shared/RecipeSwipeCard";
import { useRouter } from 'next/navigation';
import { useRecipes } from "@/context/RecipeContext";
import Loader from "@/components/ui/Loader";
import { useFavorites } from "@/context/FavoritesContext";
import { motion, AnimatePresence } from 'framer-motion';
import { MoveLeft, MoveRight, MoveUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecommendationsPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { recipes, loading } = useRecipes();
  const { addFavorite } = useFavorites();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Проверяем, первый ли это визит пользователя
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('seenSwipeTutorial');
    if (!hasSeenTutorial && !loading && recipes.length > 0) {
      setShowTutorial(true);
      localStorage.setItem('seenSwipeTutorial', 'true');
    }
  }, [loading, recipes]);

  // Функция для пошагового продвижения по туториалу
  const nextTutorialStep = () => {
    if (tutorialStep < 2) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      setTutorialStep(0);
    }
  };

  // Закрыть туториал
  const closeTutorial = () => {
    setShowTutorial(false);
    setTutorialStep(0);
  };

  const handleDislike = () => {
    showNextRecipe();
  };

  const handleSkip = () => {
    showNextRecipe();
  };

  const showNextRecipe = () => {
    if (currentIndex < recipes.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 500);
    }
  };

  const handleViewRecipe = (recipe) => {
    router.push(`/recipe/${recipe.id}`);
  };

  if (loading) {
    return <Loader />;
  }

  // Содержимое шагов туториала
  const tutorialContent = [
    {
      title: "Свайпните влево",
      description: "Чтобы пропустить рецепт, который вам не нравится. Похожие рецепты мы не будем показывать вам",
      icon: <MoveLeft className="w-8 h-8 text-white" />,
      action: "влево",
      color: "bg-red-500"
    },
    {
      title: "Свайпните вверх",
      description: "Чтобы открыть и изучить рецепт подробнее",
      icon: <MoveUp className="w-8 h-8 text-white" />,
      action: "вверх",
      color: "bg-green-500"
    },
    {
      title: "Свайпните вправо",
      description: "Чтобы пропустить рецепт",
      icon: <MoveRight className="w-8 h-8 text-white" />,
      action: "вправо",
      color: "bg-blue-500"
    }
  ];

  return (
    <Container className="py-8 relative">
      <div className="max-w-md mx-auto">
        {recipes.length > 0 && currentIndex < recipes.length ? (
          <RecipeSwipeCard
            recipe={recipes[currentIndex]}
            onSkip={handleSkip}
            onDislike={handleDislike}
            onViewRecipe={handleViewRecipe}
          />
        ) : (
          <div className="h-96 flex items-center justify-center rounded-lg bg-gray-100">
            <p className="text-gray-500">Рецепты закончились</p>
          </div>
        )}

        {/* Интерактивный туториал по свайпам для мобильных устройств при первом посещении */}
        <AnimatePresence>
          {showTutorial && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 md:hidden"
            >
              <motion.div 
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-6 max-w-xs mx-4 relative"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
              >
                <button 
                  onClick={closeTutorial}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
                
                <div className="flex flex-col items-center text-center mb-6">
                  <motion.div 
                    className={`p-4 rounded-full ${tutorialContent[tutorialStep].color} mb-4`}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "loop", 
                      duration: 1.5 
                    }}
                  >
                    {tutorialContent[tutorialStep].icon}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">{tutorialContent[tutorialStep].title}</h3>
                  <p className="text-gray-600">{tutorialContent[tutorialStep].description}</p>
                </div>

                <div className="flex justify-center mb-4">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((step) => (
                      <div 
                        key={step} 
                        className={`w-2 h-2 rounded-full ${tutorialStep === step ? 'bg-primary' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>

                <Button 
                  variant="default" 
                  className="w-full" 
                  onClick={nextTutorialStep}
                >
                  {tutorialStep < 2 ? "Далее" : "Начать"}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Container>
  );
}