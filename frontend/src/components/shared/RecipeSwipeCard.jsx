'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ThumbsDown, Bookmark, Eye, FastForward, Clock, ChefHat } from 'lucide-react';
import { DIFFICULTY } from '@/constants/difficulty';
import minutesToHuman from '@/utils/minutesToHuman';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


const RecipeSwipeCard = ({ 
  recipe, 
  direction = null,
  onSkip = () => console.log('Skip'), 
  onDislike = () => console.log('Dislike'), 
  onLike = () => console.log('Like'), 
  onViewRecipe = () => console.log('View recipe') 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);
  const router = useRouter();

  // Motion values для плавной анимации
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0.3, 1, 1, 1, 0.3]);

  // Цвета для индикаторов свайпа
  const leftColor = useTransform(x, [0, -120], [0, 1]);
  const rightColor = useTransform(x, [0, 120], [0, 1]);
  const upColor = useTransform(y, [0, -120], [0, 1]);
  
  const variants = {
    enter: { 
      scale: 0.95, 
      opacity: 0,
      y: 30,
      rotateY: -5
    },
    center: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 35,
        duration: 0.6
      }
    },
    exit: (direction) => ({
      x: direction === 'right' ? 400 : direction === 'left' ? -400 : 0,
      y: direction === 'up' ? -400 : 0,
      opacity: 0,
      scale: 0.9,
      rotate: direction === 'right' ? 20 : direction === 'left' ? -20 : 0,
      transition: { 
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    })
  };

  // Сброс direction после анимации выхода
  const handleAnimationComplete = () => {
    if (direction) setDirection(null);
  };

  const handleDislike = () => {
    onDislike(recipe);
  };

  const handleLike = () => {
    onLike(recipe);
  };

  const handleView = () => {
    onViewRecipe(recipe);
  };

  const handleSkip = () => {
    onSkip(recipe);
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const { offset, velocity } = info;
    
    // Увеличены пороги для более точного управления
    if (Math.abs(offset.x) > 120 || Math.abs(velocity.x) > 1000) {
      if (offset.x > 0) {
        handleLike();
      } else {
        handleDislike();
      }
    } else if (offset.y < -120 || velocity.y < -1000) {
      handleSkip();
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-2 w-full"
      style={{ minHeight: '60vh', height: '100%', maxWidth: '100vw' }}
      ref={constraintsRef}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={recipe.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.18}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ x, y, rotate, opacity }}
          className="relative w-full max-w-xs md:max-w-md aspect-[3/4] md:h-[650px] h-[70vw] min-h-[340px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing bg-white"
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onAnimationComplete={handleAnimationComplete}
        >
          {/* Overlay индикаторы свайпа */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-red-500/90 to-red-600/90 flex items-center justify-center z-30 rounded-3xl backdrop-blur-sm"
            style={{ opacity: leftColor }}
          >
            <div className="bg-white rounded-full p-6 shadow-xl">
              <ThumbsDown className="w-10 h-10 text-red-500" />
            </div>
          </motion.div>

          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-pink-500/90 to-rose-500/90 flex items-center justify-center z-30 rounded-3xl backdrop-blur-sm"
            style={{ opacity: rightColor }}
          >
            <div className="bg-white rounded-full p-6 shadow-xl">
              <Bookmark className="w-10 h-10 text-pink-500 fill-pink-500" />
            </div>
          </motion.div>

          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-blue-500/90 to-indigo-500/90 flex items-center justify-center z-30 rounded-3xl backdrop-blur-sm"
            style={{ opacity: upColor }}
          >
            <div className="bg-white rounded-full p-6 shadow-xl">
              <FastForward className="w-10 h-10 text-blue-500" />
            </div>
          </motion.div>

          {/* Основной контент карточки */}
          <div className="absolute inset-0">
            <div className="relative h-full">
              {/* Изображение */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
                <Image
                  src={recipe.image_url || '/images/image-dummy.svg'}
                  alt={recipe.title}
                  fill
                  priority
                  unoptimized={true}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Многослойный градиент */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
              
              {/* Кнопка просмотра в правом верхнем углу */}
              <motion.button
                onClick={handleView}
                className="absolute top-4 right-4 z-40 bg-white/80 backdrop-blur-md border border-white/30 rounded-full w-12 h-12 flex items-center justify-center text-gray-800 hover:bg-white/90 transition-all duration-200 shadow-lg cursor-pointer"
                style={{ pointerEvents: 'auto' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-5 h-5" />
              </motion.button>
              
              {/* Badges сверху слева */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                  <Clock className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-800">
                    {minutesToHuman(recipe.cook_time_minutes)}
                  </span>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                  <ChefHat className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-800">
                    {DIFFICULTY[recipe.difficulty]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Контент внизу */}
          <div className="absolute inset-x-0 bottom-0 p-6 text-white z-10">
            <motion.h3 
              className="text-2xl font-bold mb-3 leading-tight"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {recipe.title}
            </motion.h3>
            
            <motion.p 
              className="text-sm mb-6 opacity-90 line-clamp-3 leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {recipe.short_description}
            </motion.p>
            
            {/* Индикаторы свайпов */}
            <motion.div 
              className="mt-6 text-center text-xs text-white/70 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 2 }}
            >
              <div className="flex justify-center items-center gap-4">
                <span className="flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3" /> Дизлайк
                </span>
                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                <span className="flex items-center gap-1">
                  <FastForward className="w-3 h-3" /> Скип
                </span>
                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                <span className="flex items-center gap-1">
                  <Bookmark className="w-3 h-3" /> Сохранить
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Кнопки управления теперь под карточкой */}
      <div className="flex justify-center gap-4 md:gap-6 mt-4 md:mt-6 w-full">
        <button
          onClick={() => handleDislike()}
          className="rounded-full w-14 h-14 md:w-14 md:h-14 bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white hover:bg-red-500/80 hover:border-red-400 transition-all duration-300 group shadow-lg cursor-pointer text-xl md:text-2xl"
          type="button"
        >
          <ThumbsDown className="text-black w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={() => handleSkip()}
          className="rounded-full w-16 h-16 md:w-16 md:h-16 bg-white/95 backdrop-blur-md text-gray-800 hover:bg-blue-500/90 hover:text-white transition-all duration-300 group shadow-xl border-2 border-white/50 flex items-center justify-center cursor-pointer text-xl md:text-2xl"
          type="button"
        >
          <FastForward className="w-7 h-7 md:w-8 md:h-8 group-hover:scale-110 transition-transform mx-auto" />
        </button>
        <button
          onClick={() => handleLike()}
          className="rounded-full w-14 h-14 md:w-14 md:h-14 bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white hover:bg-pink-500/80 hover:border-pink-400 transition-all duration-300 group shadow-lg cursor-pointer text-xl md:text-2xl"
          type="button"
        >
          <Bookmark className="text-black w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};

// Компонент демонстрации для тестирования
const SwipeDemo = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const [recipes] = useState([
    {
      id: 1,
      title: "Паста Карбонара",
      short_description: "Классическая итальянская паста с беконом, яйцами и сыром пармезан. Простое, но невероятно вкусное блюдо.",
      image_url: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=600&fit=crop",
      cook_time_minutes: 25,
      difficulty: "MEDIUM",
    },
    {
      id: 2,
      title: "Суши роллы",
      short_description: "Свежие суши роллы с лососем, авокадо и огурцом. Идеальный баланс вкусов японской кухни.",
      image_url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=600&fit=crop",
      cook_time_minutes: 45,
      difficulty: "HARD",
    },
    {
      id: 3,
      title: "Шоколадный торт",
      short_description: "Нежный шоколадный торт с кремом из маскарпоне. Идеальный десерт для особых случаев.",
      image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=600&fit=crop",
      cook_time_minutes: 90,
      difficulty: "MEDIUM",
    }
  ]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % recipes.length);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md w-full">
        <RecipeSwipeCard
          recipe={recipes[currentIndex]}
          onLike={handleNext}
          onDislike={handleNext}
          onSkip={handleNext}
          onViewRecipe={(recipe) => router.push(`/recipe/${recipe.id}`)}
        />
      </div>
    </div>
  );
};

export default SwipeDemo;