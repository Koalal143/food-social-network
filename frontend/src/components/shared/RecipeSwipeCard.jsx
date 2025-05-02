'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { HeartCrack, ArrowRight, Bookmark } from 'lucide-react';

const RecipeSwipeCard = ({ recipe, onLike, onDislike, onViewRecipe }) => {
  const [direction, setDirection] = useState(null);

  const variants = {
    enter: { x: 0, opacity: 1 },
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction === 'right' ? 200 : -200,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  };

  const handleLike = () => {
    setDirection('right');
    onLike(recipe);
  };

  const handleDislike = () => {
    setDirection('left');
    onDislike(recipe);
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={recipe.id}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="absolute inset-0">
          <Image
            src={recipe.preview}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {recipe.time}
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {recipe.difficulty}
            </span>
          </div>
          <p className="text-sm mb-4 opacity-90">{recipe.shortDescription}</p>
          
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleDislike}
              size="lg"
              variant="secondary"
              className="rounded-full w-16 h-16 flex items-center justify-center bg-red-600"
            >
              <HeartCrack className="w-6 h-6" />
            </Button>
            <Button
              onClick={handleLike}
              size="lg"
              variant="secondary"
              className="rounded-full w-16 h-16 flex items-center justify-center"
            >
              <Bookmark className="w-6 h-6" />
            </Button>
            <Button
              onClick={() => onViewRecipe(recipe)}
              size="lg"
              variant="secondary"
              className="rounded-full w-16 h-16 flex items-center justify-center bg-green-500 hover:bg-green-600"
            >
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecipeSwipeCard; 