'use client';
import { useState, useEffect } from 'react';
import Container from "@/components/layout/Container";
import RecipeSwipeCard from "@/components/shared/RecipeSwipeCard";
import { useRouter } from 'next/navigation';
import { useRecipes } from "@/context/RecipeContext";
import Loader from "@/components/ui/Loader";
import { useFavorites } from "@/context/FavoritesContext";
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, ThumbsDown, Eye, Info, ChevronRight, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function RecommendationsPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { recipes, loading } = useRecipes();
  const { addFavorite } = useFavorites();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [direction, setDirection] = useState(null);

  // Показываем туториал при первом визите
  useEffect(() => {
    if (!loading && recipes.length > 0) {
      // Можно добавить логику проверки первого визита
      // setShowTutorial(true);
    }
  }, [loading, recipes]);

  // Функция для пошагового продвижения по туториалу
  const nextTutorialStep = () => {
    if (tutorialStep < 3) {
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
    setDirection('left');
    if (currentIndex < recipes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    setDirection('up');
    if (currentIndex < recipes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleLike = () => {
    if (recipes[currentIndex]) {
      addFavorite(recipes[currentIndex], 'recs');
    }
    setDirection('right');
    if (currentIndex < recipes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleViewRecipe = (recipe) => {
    router.push(`/recipe/${recipe.slug}?source=recs-detail`);
  };

  const handleRefresh = () => {
    setCurrentIndex(0);
    setDirection(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Содержимое шагов туториала
  const tutorialContent = [
    {
      title: "Свайп влево",
      subtitle: "Дизлайк",
      description: "Свайпните влево или нажмите на кнопку, чтобы отклонить рецепт. Мы учтём ваши предпочтения для будущих рекомендаций.",
      icon: <ThumbsDown className="w-6 h-6" />,
      action: "left",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      gesture: "←"
    },
    {
      title: "Свайп вверх",
      subtitle: "Скип",
      description: "Свайпните вверх или нажмите на кнопку, чтобы просто пропустить рецепт без лайка или дизлайка.",
      icon: <RefreshCw className="w-6 h-6" />,
      action: "up",
      color: "bg-gradient-to-br from-blue-500 to-indigo-500",
      gesture: "↑"
    },
    {
      title: "Свайп вправо",
      subtitle: "Лайк",
      description: "Свайпните вправо или нажмите на кнопку, чтобы добавить рецепт в избранное. Вы сможете найти его в разделе 'Избранное' в вашем профиле.",
      icon: <Bookmark className="w-6 h-6" />,
      action: "right",
      color: "bg-gradient-to-br from-pink-500 to-rose-500",
      gesture: "→"
    },
    {
      title: "Кнопка 'Глаз'",
      subtitle: "Посмотреть рецепт",
      description: "Нажмите на иконку 👁️ в правом верхнем углу карточки, чтобы открыть подробную страницу рецепта.",
      icon: <Eye className="w-6 h-6" />,
      action: "eye",
      color: "bg-gradient-to-br from-gray-500 to-gray-700",
      gesture: "👁️"
    }
  ];

  return (
    <ProtectedRoute>
      <Container className="py-2 h-full md:py-4 relative px-2 md:px-0">
        <div className="max-w-xs md:max-w-md mx-auto">
          <AnimatePresence
            mode="wait"
            onExitComplete={() => setDirection(null)}
          >
            {recipes.length > 0 && currentIndex < recipes.length ? (
              <RecipeSwipeCard
                key={currentIndex}
                recipe={recipes[currentIndex]}
                direction={direction}
                onSkip={handleSkip}
                onDislike={handleDislike}
                onLike={handleLike}
                onViewRecipe={handleViewRecipe}
              />
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-80 md:h-96 flex flex-col items-center justify-center rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-50 via-white to-blue-50 border border-gray-200 shadow-lg overflow-hidden px-4"
              >
                {/* Декоративные элементы */}
                <div className="absolute top-4 left-4 w-8 h-8 md:w-12 md:h-12 bg-yellow-200/30 rounded-full blur-xl" />
                <div className="absolute bottom-6 right-6 w-6 h-6 md:w-8 md:h-8 bg-blue-200/30 rounded-full blur-lg" />
                <div className="absolute top-1/2 right-4 w-4 h-4 md:w-6 md:h-6 bg-pink-200/30 rounded-full blur-md" />
                
                <motion.div 
                  className="text-5xl md:text-6xl mb-4"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatType: "reverse" 
                  }}
                >
                  🍽️
                </motion.div>
                <h3 className="text-gray-700 text-lg md:text-xl font-bold mb-2 text-center">
                  Рецепты закончились
                </h3>
                <p className="text-gray-500 text-sm md:text-base text-center mb-4 px-2 md:px-4">
                  Попробуйте обновить рекомендации
                </p>
                <Button 
                  onClick={handleRefresh}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-6 py-2 rounded-full shadow-lg text-base md:text-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Обновить список
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Интерактивный туториал для всех устройств */}
          <AnimatePresence>
            {showTutorial && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4"
                onClick={closeTutorial}
              >
                <motion.div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 max-w-xs md:max-w-sm w-full mx-2 md:mx-4 relative shadow-2xl"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <button 
                    onClick={closeTutorial}
                    className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="flex flex-col items-center text-center mb-6">
                    <motion.div 
                      className={`p-4 rounded-full ${tutorialContent[tutorialStep].color} mb-4 relative overflow-hidden`}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ 
                        repeat: Infinity, 
                        repeatType: "loop", 
                        duration: 2 
                      }}
                    >
                      <div className="text-white relative z-10">
                        {tutorialContent[tutorialStep].icon}
                      </div>
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0, 0.5] 
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 2,
                          ease: "easeInOut"
                        }}
                      />
                    </motion.div>

                    <div className="text-3xl md:text-4xl mb-2 font-bold text-gray-300">
                      {tutorialContent[tutorialStep].gesture}
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold mb-1 text-gray-900">
                      {tutorialContent[tutorialStep].title}
                    </h3>
                    <p className="text-xs md:text-sm font-medium text-gray-600 mb-3">
                      {tutorialContent[tutorialStep].subtitle}
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                      {tutorialContent[tutorialStep].description}
                    </p>
                  </div>

                  {/* Индикатор прогресса */}
                  <div className="flex justify-center mb-6">
                    <div className="flex gap-2">
                      {[...Array(tutorialContent.length).keys()].map((step) => (
                        <motion.div 
                          key={step} 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            tutorialStep === step 
                              ? 'w-8 bg-gray-900' 
                              : 'w-2 bg-gray-300'
                          }`}
                          layoutId={`step-${step}`}
                        />
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 md:py-3 text-base md:text-sm rounded-full" 
                    onClick={nextTutorialStep}
                  >
                    {tutorialStep < tutorialContent.length - 1 ? (
                      <span className="flex items-center gap-2">
                        Далее
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    ) : (
                      "Начать свайпы"
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Заголовок и кнопки управления */}
        <motion.div 
          className="max-w-xs md:max-w-md mx-auto mt-2 md:mt-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTutorial(true)}
              className="flex items-center bg-white/80 backdrop-blur-sm hover:bg-white/90 border-gray-200 shadow-sm rounded-full px-4 py-2 text-base md:text-sm"
            >
              <Info className="w-4 h-4" />
              Как пользоваться
            </Button>
          </div>
        </motion.div>
      </Container>
    </ProtectedRoute>
  )
}