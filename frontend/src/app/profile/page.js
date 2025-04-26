"use client"

import Container from "@/components/Container"
import RecipeCard from "../../components/shared/RecipeCard";
import { useRecipes } from "@/context/RecipeContext";
import Loader from "@/components/ui/Loader";

const user = {
  name: "Тетя Зина",
  experience: "69 лет",
  image: "/images/ava.jpg"
}

export default function ProfilePage() {
  const { recipes, loading } = useRecipes();

  if (loading) {
    return <Loader />
  }

  return (
    <Container className="py-6">
      <h2 className="text-2xl font-bold mb-6">Ваш профиль</h2>
      <div className="flex items-center mb-6">
        <img
          src={user.image}
          alt={user.name}
          className="w-24 h-24 rounded-full mr-4"
        />
        <div>
          <h3 className="text-xl font-semibold">{user.name}</h3>
          <p className="text-gray-600">Стаж в готовке: {user.experience}</p>
        </div>
      </div>
      <h3 className="text-lg font-bold mb-4">Ваши рецепты</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </Container>
  )
}