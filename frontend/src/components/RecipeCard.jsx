import Image from 'next/image';
import Link from 'next/link';

const RecipeCard = ({ recipe }) => {
  return (
    <Link href={`/recipe/${recipe.id}`} className="group">
      <article className="bg-background border border-border rounded-lg overflow-hidden transition-transform hover:-translate-y-1">
        <div className="relative aspect-[4/3]">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">рецепт</span>
            <span className="text-sm text-muted-foreground">{recipe.cookingTime}</span>
          </div>
          <h3 className="font-medium mb-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
        </div>
      </article>
    </Link>
  );
};

export default RecipeCard; 