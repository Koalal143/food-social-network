'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const RecipeCard = ({ recipe, className }) => {
  return (
    <Link href={`/recipe/${recipe.id}`}>
      <div className={cn(
        "group relative bg-card rounded-lg overflow-hidden border border-border transition-all hover:border-primary",
        className
      )}>
        <div className={cn(
          "relative",
          className?.includes('flex-row') ? "w-48 h-32" : "w-full aspect-[4/3]"
        )}>
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {recipe.description}
          </p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>⏱ {recipe.cookingTime}</span>
            <span>📊 {recipe.difficulty}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard; 