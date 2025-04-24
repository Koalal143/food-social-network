"use client";
import { useEffect, useState } from "react";
import Container from "@/components/Container"
import RecipeCard from "../components/shared/RecipeCard";

import RecipesService from "../services/recipes.service";

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await RecipesService.getAllReceipts();
        setRecipes(data);
      } catch (error) {
        console.error("Ошибка при загрузке рецептов:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) {
    return <Container className="py-6">Загрузка...</Container>;
  }

  return (
    <Container className={"py-6"}>
        <h2 className="text-2xl font-bold mb-6">Популярные рецепты</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
    </Container>
  )
}