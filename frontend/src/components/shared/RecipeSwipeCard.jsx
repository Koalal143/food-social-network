'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { ThumbsDown, Eye, FastForward, Clock } from 'lucide-react';
import minutesToHuman from '@/utils/minutesToHuman';
import { DIFFICULTY } from '@/constants/difficulty';
import { useSwipeable } from 'react-swipeable';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const RecipeSwipeCard = ({ recipe, onLike, onDislike, onViewRecipe }) => {
  const [direction, setDirection] = useState(null);
  
  const variants = {
    enter: { x: 0, opacity: 1, scale: 1 },
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction) => ({
      x: direction === 'right' ? 500 : direction === 'left' ? -500 : 0,
      y: direction === 'up' ? -500 : 0,
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 }
    })
  };

  const handleDislike = () => {
    setDirection('left');
    onDislike(recipe);
  };

  const handleView = () => {
    setDirection('up');
    onViewRecipe(recipe);
  };

  const handleSkip = () => {
    setDirection('right');
    onLike(recipe);
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleDislike,
    onSwipedRight: handleSkip,
    onSwipedUp: handleView,
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
  });

  return (
    <TooltipProvider>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={recipe.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg touch-none"
          {...handlers}
        >
          <div className="absolute inset-0">
            <Image
              src={recipe.image_url || '/images/image-dummy.svg'}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
              unoptimized={true}
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/80 to-transparent" />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">
              {recipe.title}
            </h3>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>{minutesToHuman(recipe.cook_time_minutes)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>{DIFFICULTY[recipe.difficulty]}</span>
              </div>
            </div>
            
            <p className="text-sm mb-6 opacity-90 line-clamp-3">
              {recipe.short_description}
            </p>
            
            <div className="flex justify-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleDislike}
                    size="lg"
                    variant="destructive"
                    className="rounded-full w-16 h-16 flex items-center justify-center"
                  >
                    <ThumbsDown className="w-6 h-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Не нравится</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleView}
                    size="lg"
                    variant="default"
                    className="rounded-full w-16 h-16 flex items-center justify-center bg-green-500 hover:bg-green-600"
                  >
                    <Eye className="w-6 h-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Открыть рецепт</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSkip}
                    size="lg"
                    variant="secondary"
                    className="rounded-full w-16 h-16 flex items-center justify-center bg-blue-500 hover:bg-blue-600"
                  >
                    <FastForward className="w-6 h-6 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Пропустить</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default RecipeSwipeCard;