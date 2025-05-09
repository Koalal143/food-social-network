import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs"
import RecipesList from "@/components/layout/RecipesList"
import { Button } from "../button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ProfileTabs({ recipes, favorites }) {
    return (
        <Tabs defaultValue="recipes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="recipes">Мои рецепты</TabsTrigger>
                <TabsTrigger value="favorites">Избранное</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recipes" className="space-y-4">
                <RecipesList 
                    recipes={recipes}
                    emptyMessage="У вас пока нет рецептов"
                    emptyAction={
                        <Button asChild>
                            <Link href="/recipe/add">
                                <Plus className="mr-2 h-4 w-4" />
                                Добавить первый рецепт
                            </Link>
                        </Button>
                    }
                />
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
                <RecipesList 
                    recipes={favorites}
                    emptyMessage="У вас пока нет избранных рецептов"
                    emptyAction={
                        <Button asChild variant="outline">
                            <Link href="/recommendations">
                                Найти рецепты
                            </Link>
                        </Button>
                    }
                />
            </TabsContent>
        </Tabs>
    )
}