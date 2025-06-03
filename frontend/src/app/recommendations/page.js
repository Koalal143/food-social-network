'use client';
import { useState, useEffect } from 'react';
import Container from "@/components/layout/Container";
import RecipeSwipeCard from "@/components/shared/RecipeSwipeCard";
import { useRouter } from 'next/navigation';
import { useRecomendations } from '@/context/RecomendationsContext';
import { useDislikes } from '@/context/DislikesContext';
import Loader from "@/components/ui/Loader";
import { useFavorites } from "@/context/FavoritesContext";
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, ThumbsDown, Eye, Info, ChevronRight, RefreshCw, X, FastForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function RecommendationsPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { recipes, loading, fetchRecipes } = useRecomendations();
  const { addFavorite } = useFavorites();
  const { addToDisliked } = useDislikes();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [direction, setDirection] = useState(null);

  const nextTutorialStep = () => {
    if (tutorialStep < 3) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      setTutorialStep(0);
    }
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    setTutorialStep(0);
  };

  const handleDislike = () => {
    if (recipes[currentIndex]) {
      addToDisliked(recipes[currentIndex].id)
    }
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
      addFavorite(recipes[currentIndex].id);
    }
    setDirection('right');
    if (currentIndex < recipes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleViewRecipe = (recipe) => {
    router.push(`/recipe/${recipe.slug}?source=recs-detail`);
  };

  useEffect(() => {
    if (currentIndex >= recipes.length - 1 && recipes.length > 0) {
      fetchRecipes(true);
    }
  }, [currentIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    );
  }

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
      <Container className="h-full flex flex-col">
        <div className="flex-grow">
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
                className="mt-6 relative h-80 md:h-96 flex flex-col items-center justify-center rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-50 via-white to-blue-50 border border-gray-200 shadow-lg overflow-hidden px-4 max-w-sm mx-auto"
              >
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
                  Нам еще не понятно, что вам нравится
                </h3>
                <p className="text-gray-500 text-sm md:text-base text-center mb-4 px-2 md:px-4">
                  Попробуйте добавлять рецепты в избранное, чтобы мы могли понять ваши предпочтения.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Кнопки лайк, дизлайк, скип */}
        {recipes.length > 0 && currentIndex < recipes.length && (
          <motion.div className="my-4">
            <div className="flex justify-center gap-4 md:gap-6">
              <button
                onClick={handleDislike}
                className="rounded-full w-14 h-14 md:w-14 md:h-14 bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white hover:bg-red-500/80 hover:border-red-400 transition-all duration-300 group shadow-lg cursor-pointer text-xl md:text-2xl"
                type="button"
              >
                <ThumbsDown className="text-black w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={handleSkip}
                className="rounded-full w-16 h-16 md:w-16 md:h-16 bg-white/95 backdrop-blur-md text-gray-800 hover:bg-blue-500/90 hover:text-white transition-all duration-300 group shadow-xl border-2 border-white/50 flex items-center justify-center cursor-pointer text-xl md:text-2xl"
                type="button"
              >
                <FastForward className="w-7 h-7 md:w-8 md:h-8 group-hover:scale-110 transition-transform mx-auto" />
              </button>
              <button
                onClick={handleLike}
                className="rounded-full w-14 h-14 md:w-14 md:h-14 bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white hover:bg-pink-500/80 hover:border-pink-400 transition-all duration-300 group shadow-lg cursor-pointer text-xl md:text-2xl"
                type="button"
              >
                <Bookmark className="text-black w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Кнопка инструкции внизу страницы */}
        <motion.div 
          className="my-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowTutorial(true)}
              className="flex items-center bg-white/80 backdrop-blur-sm hover:bg-white/90 border-gray-200 shadow-sm rounded-full px-6 py-3 text-base md:text-sm"
            >
              <Info className="w-5 h-5 mr-2" />
              Как пользоваться
            </Button>
          </div>
        </motion.div>

        {/* Интерактивный туториал */}
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
      </Container>
    </ProtectedRoute>
  )
}