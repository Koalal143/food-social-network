import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

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
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">{recipe.title}</h3>
          <p className="text-sm mb-4 opacity-90">{recipe.description}</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {recipe.cookingTime}
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {recipe.difficulty}
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center gap-4">
          <Button
            onClick={handleDislike}
            size="lg"
            variant="destructive"
            className="rounded-full w-16 h-16 flex items-center justify-center"
          >
            ✕
          </Button>
          <Button
            onClick={() => onViewRecipe(recipe)}
            size="lg"
            variant="secondary"
            className="rounded-full w-16 h-16 flex items-center justify-center"
          >
            👁
          </Button>
          <Button
            onClick={handleLike}
            size="lg"
            className="rounded-full w-16 h-16 flex items-center justify-center bg-green-500 hover:bg-green-600"
          >
            ♥
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecipeSwipeCard; 