import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs"
import RecipesList from "@/components/shared/RecipesList"
import InfiniteRecipesList from "@/components/shared/InfiniteRecipeList"
import { Button } from "../button"
import { Plus, Search, ChefHat, Heart } from "lucide-react"
import Link from "next/link"

export default function ProfileTabs({ 
    recipes, 
    favorites, 
    loadMoreFavorites, 
    hasMore, 
    isFavoritesLoading 
}) {
    const EmptyState = ({ icon: Icon, title, description, buttonText, buttonLink, variant = "default" }) => (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="bg-secondary/60 p-4 rounded-full">
                <Icon className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold text-xl">{title}</h3>
                <p className="text-muted-foreground max-w-sm">{description}</p>
            </div>
            <Button asChild variant={variant}>
                <Link href={buttonLink}>
                    {variant === "default" && <Plus className="mr-2 h-4 w-4" />}
                    {variant === "outline" && <Search className="mr-2 h-4 w-4" />}
                    {buttonText}
                </Link>
            </Button>
        </div>
    )

    return (
        <Tabs defaultValue="recipes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="recipes">
                    <ChefHat className="w-4 h-4 mr-2" />
                    Мои рецепты
                </TabsTrigger>
                <TabsTrigger value="favorites">
                    <Heart className="w-4 h-4 mr-2" />
                    Избранное
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recipes" className="space-y-4">
                {recipes && recipes.length > 0 ? (
                    <RecipesList recipes={recipes} />
                ) : (
                    <EmptyState 
                        icon={ChefHat}
                        title="У вас пока нет рецептов"
                        description="Поделитесь своими кулинарными шедеврами с сообществом! Добавьте свой первый рецепт."
                        buttonText="Добавить первый рецепт"
                        buttonLink="/recipe/add"
                    />
                )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
                {favorites && favorites.length > 0 ? (
                    <InfiniteRecipesList
                        recipes={favorites}
                        loading={isFavoritesLoading}
                        hasMore={hasMore}
                        onLoadMore={loadMoreFavorites}
                        source="favorites"
                    />
                ) : (
                    <EmptyState 
                        icon={Heart}
                        title="В избранном пусто"
                        description="Находите интересные рецепты и добавляйте их в избранное, чтобы сохранить для будущего приготовления"
                        buttonText="Найти рецепты"
                        buttonLink="/recommendations"
                        variant="outline"
                    />
                )}
            </TabsContent>
        </Tabs>
    )
}

// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs"
// import RecipesList from "@/components/shared/RecipesList"
// import { Button } from "../button"
// import { Plus, Search, ChefHat, Heart } from "lucide-react"
// import Link from "next/link"
// import InfiniteRecipesList from "@/components/shared/InfiniteRecipeList"

// export default function ProfileTabs({ recipes, favorites }) {
//     const EmptyState = ({ icon: Icon, title, description, buttonText, buttonLink, variant = "default" }) => (
//         <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
//             <div className="bg-secondary/60 p-4 rounded-full">
//                 <Icon className="w-8 h-8 text-primary" />
//             </div>
//             <div className="space-y-2">
//                 <h3 className="font-semibold text-xl">{title}</h3>
//                 <p className="text-muted-foreground max-w-sm">{description}</p>
//             </div>
//             <Button asChild variant={variant}>
//                 <Link href={buttonLink}>
//                     {variant === "default" && <Plus className="mr-2 h-4 w-4" />}
//                     {variant === "outline" && <Search className="mr-2 h-4 w-4" />}
//                     {buttonText}
//                 </Link>
//             </Button>
//         </div>
//     )

//     return (
//         <Tabs defaultValue="recipes" className="w-full">
//             <TabsList className="grid w-full grid-cols-2 mb-6">
//                 <TabsTrigger value="recipes">
//                     <ChefHat className="w-4 h-4 mr-2" />
//                     Мои рецепты
//                 </TabsTrigger>
//                 <TabsTrigger value="favorites">
//                     <Heart className="w-4 h-4 mr-2" />
//                     Избранное
//                 </TabsTrigger>
//             </TabsList>
            
//             <TabsContent value="recipes" className="space-y-4">
//                 {recipes && recipes.length > 0 ? (
//                     <RecipesList recipes={recipes} />
//                 ) : (
//                     <EmptyState 
//                         icon={ChefHat}
//                         title="У вас пока нет рецептов"
//                         description="Поделитесь своими кулинарными шедеврами с сообществом! Добавьте свой первый рецепт."
//                         buttonText="Добавить первый рецепт"
//                         buttonLink="/recipe/add"
//                     />
//                 )}
//             </TabsContent>

//             <TabsContent value="favorites" className="space-y-4">
//                 {favorites && favorites.length > 0 ? (
//                     <InfiniteRecipesList
//                         recipes={favorites}
//                     />
//                 ) : (
//                     <EmptyState 
//                         icon={Heart}
//                         title="В избранном пусто"
//                         description="Находите интересные рецепты и добавляйте их в избранное, чтобы сохранить для будущего приготовления"
//                         buttonText="Найти рецепты"
//                         buttonLink="/recommendations"
//                         variant="outline"
//                     />
//                 )}
//             </TabsContent>
//         </Tabs>
//     )
// }