import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs"
import InfiniteRecipesList from "@/components/shared/InfiniteRecipeList"
import { ChefHat, Heart } from "lucide-react"
import EmptyState from "@/components/ui/EmptyState"

export default function ProfileTabs({ 
    recipes, 
    favorites, 
    loadMoreFavorites, 
    hasMoreRecipes,
    hasMoreFavs,
    isFavoritesLoading, 
    loadMoreRecipes,
    isLoading
}) {


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
                    <InfiniteRecipesList 
                        recipes={recipes}
                        loading={isLoading}
                        hasMore={hasMoreRecipes}
                        onLoadMore={loadMoreRecipes}
                        source="author-page"
                        editable={true}
                    />
                ) : (
                    <EmptyState
                        icon={ChefHat}
                        title="У вас пока нет рецептов"
                        description="Поделитесь своими кулинарными шедеврами с сообществом! Добавьте свой первый рецепт."
                        actionText="Добавить первый рецепт"
                        actionHref="/recipe/add"
                    />
                )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
                {favorites && favorites.length > 0 ? (
                    <InfiniteRecipesList
                        recipes={favorites}
                        loading={isFavoritesLoading}
                        hasMore={hasMoreFavs}
                        onLoadMore={loadMoreFavorites}
                        source="favorites"
                    />
                ) : (
                    <EmptyState
                        icon={Heart}
                        title="В избранном пусто"
                        description="Находите интересные рецепты и добавляйте их в избранное, чтобы сохранить для будущего приготовления"
                        actionText="Найти рецепты"
                        actionHref="/"
                        variant="outline"
                    />
                )}
            </TabsContent>
        </Tabs>
    )
}