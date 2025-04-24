"use client";
import { useState, useEffect } from "react";
import React from "react";

import Container from "@/components/Container"
import RecipeCard from "../../../components/shared/RecipeCard";
import RecipesService from "../../../services/recipes.service";

const user = {
  name: "Тетя Зина",
  experience: "69 лет",
  image: "/images/ava.jpg",
}

export default function Profile({ params }) {
    const { userId } = React.use(params);

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
        <Container className="py-6">
        <h2 className="text-2xl font-bold mb-6">{`Профиль ${userId}`}</h2>
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
        <h3 className="text-lg font-bold mb-4">Рецепты</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
        </div>
        </Container>
    )
}