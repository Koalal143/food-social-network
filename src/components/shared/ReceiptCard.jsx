import Image from "next/image";
import Link from "next/link";

export default function ReceiptCard({recipe}) {
    return (
        <Link href={`/recipe/${recipe.id}`}>
            <div className="bg-card rounded-lg overflow-hidden cursor-pointer hover:rounded-none">
                <div className="relative aspect-video">
                    <Image 
                        src={recipe.image} 
                        alt={recipe.title}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="p-3 pl-0 space-y-1">
                    <h3 className="font-medium line-clamp-2">{recipe.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                        {recipe.tags?.map((tag) => (
                            <span 
                                key={tag}
                                className="px-2 py-1 text-xs bg-muted rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    )
}