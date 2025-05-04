"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import RecipeCard from "./RecipeCard"
import { Button } from "../ui/button"
import EmptyState from "./favorites/EmptyState"

export default function ProfileTabs({ userRecipes, favorites }) {
  return (
    <Tabs defaultValue="recipes" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="recipes">Ваши рецепты</TabsTrigger>
        <TabsTrigger value="favorites">Избранное</TabsTrigger>
      </TabsList>
      
      <TabsContent value="recipes">
        {userRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">У вас пока нет рецептов</p>
            <Link 
              href="/recipe/add"
              className="inline-block bg-muted-foreground text-white primary-500 px-6 py-2 rounded-xl hover:bg-secondary-foreground transition-colors"
            >
              Создать первый рецепт
            </Link>
          </div>
        )}
      </TabsContent>

      <TabsContent value="favorites">
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <EmptyState hasFavorites={false}/>
        )}
      </TabsContent>
    </Tabs>
  )
} 