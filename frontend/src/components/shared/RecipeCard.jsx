import Image from "next/image";
import Link from "next/link";

export default function RecipeCard({ recipe }) {
    return (
        <div className="h-full">
            <Link href={`/recipe/${recipe.id}`}>
                <div className="bg-card/35 rounded-lg overflow-hidden hover:rounded-none cursor-pointer h-full flex flex-col">
                    <div className="relative aspect-video flex-shrink-0">
                        <Image 
                            src={recipe.preview} 
                            alt={recipe.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="pt-3 pb-3 pl-3 space-y-1 flex-grow">
                        <h3 className="font-medium line-clamp-2">
                            {recipe.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {recipe.shortDescription}
                        </p>
                    </div>
                </div>
            </Link>
        </div>
    );
}