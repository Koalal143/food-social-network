"use client"

import React, { useEffect, useState } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import Container from "@/components/layout/Container";
import { useRecipes } from "@/context/RecipeContext";
import { useUser } from "@/context/UserContext";
import Loader from "@/components/ui/Loader";
import Image from "next/image";
import AuthorCard from "@/components/ui/recipe-page/AuthorCard";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import CopyLinkButton from "@/components/ui/CopyLinkButton";
import RecipeInfoCards from "@/components/ui/recipe-page/RecipeInfoCards";
import RecipeIngridients from "@/components/ui/recipe-page/RecipeIngridients";
import RecipeInstruction from "@/components/ui/recipe-page/RecipeInstruction";

export default function RecipePage({ params }) {
  const { getRecipeById } = useRecipes();
  const { getUserById } = useUser();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [recipe, setRecipe] = useState(null);
  const [author, setAuthor] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const { id } = React.use(params);

  useEffect(() => {
    const fetchData = async () => {
      const recipeData = await getRecipeById(Number(id));
      if (recipeData) {
        setRecipe(recipeData);
        setIsSaved(isFavorite(recipeData.id));
        const authorData = await getUserById(recipeData.authorId);
        setAuthor(authorData);
      }
    };
    fetchData();
  }, [id, getRecipeById, getUserById, isFavorite]);

  const handleSave = () => {
    if (isSaved) {
      removeFavorite(recipe.id);
    } else {
      addFavorite(recipe);
    }
    setIsSaved(!isSaved);
  };

  if (!recipe || !author) {
    return <Loader />;
  }

  return (
    <Container>
      <article className="py-8">
        <div className="max-w-3xl mx-auto space-y-8 bg-secondary/60 rounded-lg pb-4">
          {/* Фотография и кнопки */}
          <div className="relative aspect-[16/9] rounded-t-lg overflow-hidden">
            <Image
              src={recipe.preview}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur rounded-full"
                onClick={handleSave}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-primary' : ''}`} />
              </Button>
              <CopyLinkButton
                link={`${window.location.origin}/recipe/${id}`}
                tooltipText="Скопировать ссылку на рецепт"
              />
            </div>
          </div>

          {/* Заголовок */}
          <div className="space-y-2 m-4">
            <h1 className="text-3xl font-bold tracking-tight">{recipe.title}</h1>
            <p className="text-lg text-muted-foreground">{recipe.shortDescription}</p>
          </div>

          {/* Информация о рецепте */}
          <RecipeInfoCards recipe={recipe} />

          {/* Карточка автора */}
          <AuthorCard author={author} />

          {/* Ингредиенты */}
          <RecipeIngridients recipe={recipe} />

          {/* Инструкция */}
          <RecipeInstruction recipe={recipe} />
        </div>
      </article>
    </Container>
  );
} 