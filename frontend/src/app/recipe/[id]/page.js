"use client"

import React, { useEffect, useState } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/layout/Container";
import { useRecipes } from "@/context/RecipeContext";
import Loader from "@/components/ui/Loader";
import Image from "next/image";
import AuthorCard from "@/components/ui/recipe-page/AuthorCard";
import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CopyLinkButton from "@/components/ui/CopyLinkButton";
import RecipeInfoCards from "@/components/ui/recipe-page/RecipeInfoCards";
import RecipeIngridients from "@/components/ui/recipe-page/RecipeIngridients";
import RecipeInstruction from "@/components/ui/recipe-page/RecipeInstruction";
import DeleteRecipeDialog from "@/components/recipe/DeleteRecipeDialog";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandler";
import { runDeleteRecipeDiagnostics } from "@/utils/deleteRecipeDiagnostics";
import NotFound from "@/app/not-found";

export default function RecipePage({ params }) {
  const { getRecipeById, error, loading } = useRecipes();
  const { addFavorite, removeFavorite } = useFavorites();
  const { user } = useAuth();
  const [ recipe, setRecipe ] = useState(null);
  const { toast } = useToast()
  const [ isSaved, setIsSaved ] = useState(false);

  const { id } = React.use(params);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getRecipeById(Number(id));
        if (recipeData) {
          setRecipe(recipeData);
          setIsSaved(recipeData.is_on_favorites);
        }
      } catch (error) {
        const { message, type } = handleApiError(error);

        toast({
          variant: type,
          title: "Ошибка",
          description: message,
        });
      }
    };
    fetchData();
  }, [id]);

  const handleSave = () => {
    if (isSaved) {
      removeFavorite(recipe.id);
    } else {
      addFavorite(recipe.id);
    }
    setIsSaved(!isSaved);
  };

  // Проверка прав на удаление рецепта
  const canDeleteRecipe = () => {
    if (!user || !recipe) return false;
    // Владелец рецепта или суперпользователь может удалить рецепт
    return user.id === recipe.author.id || user.is_superuser;
  };

  // Функция для запуска диагностики (только в режиме разработки)
  const handleDiagnostics = async () => {
    if (process.env.NODE_ENV === 'development' && recipe?.id) {
      console.log('🔍 Запуск диагностики удаления рецепта...');
      await runDeleteRecipeDiagnostics(recipe.id);
    }
  };


  if (loading) {
    return <Loader />
  }

  if (error) {
    return <NotFound />
  }

  if (!recipe) {
    return <Loader />
  }

  return (
    <Container>
      <article className="py-8">
        <div className="max-w-3xl mx-auto space-y-8 bg-secondary/60 rounded-lg pb-4">
          {/* Фотография и кнопки */}
          <div className="relative aspect-[16/9] rounded-t-lg overflow-hidden">
            <Image
              src={recipe.image_url || '/images/image-dummy.svg'}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
              unoptimized={true}
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
              {canDeleteRecipe() && (
                <DeleteRecipeDialog
                  recipe={recipe}
                  trigger={
                    <Button
                      variant="destructive"
                      size="icon"
                      className="bg-destructive/80 backdrop-blur rounded-full hover:bg-destructive"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  }
                />
              )}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/80 backdrop-blur rounded-full"
                  onClick={handleDiagnostics}
                  title="Запустить диагностику удаления"
                >
                  🔍
                </Button>
              )}
            </div>
          </div>

          {/* Заголовок */}
          <div className="space-y-2 m-4">
            <h1 className="text-3xl font-bold tracking-tight">{recipe.title}</h1>
            <p className="text-lg text-muted-foreground">{recipe.short_description}</p>
          </div>

          {/* Информация о рецепте */}
          <RecipeInfoCards recipe={recipe} />

          {/* Карточка автора */}
          <AuthorCard author={recipe.author} />

          {/* Ингредиенты */}
          <RecipeIngridients recipe={recipe} />

          {/* Инструкция */}
          <RecipeInstruction recipe={recipe} />
        </div>
      </article>
    </Container>
  );
}