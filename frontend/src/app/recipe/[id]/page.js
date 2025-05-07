"use client";
import React, { useEffect, useState } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import Container from "@/components/layout/Container";
import { useRecipes } from "@/context/RecipeContext";
import { useUser } from "@/context/UserContext";
import Loader from "@/components/ui/Loader";
import Image from "next/image";
import AuthorCard from "@/components/shared/AuthorCard";
import { Clock, User, Bookmark, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import CopyLinkButton from "@/components/ui/CopyLinkButton";

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

  if (!recipe) {
    return <Loader />;
  }

  return (
    <article className="py-8">
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Фотография и кнопки */}
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden shadow-lg">
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
                tooltipText="Скопировать ссылку на профиль"
              />
            </div>
          </div>

          {/* Заголовок */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">{recipe.title}</h1>
            <p className="text-lg text-muted-foreground">{recipe.description}</p>
          </div>

          {/* Информация о рецепте */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-lg flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-sm font-medium">Время</h3>
                <p className="text-sm text-muted-foreground">{recipe.time}</p>
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg flex items-center gap-3">
              <User className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-sm font-medium">Порций</h3>
                <p className="text-sm text-muted-foreground">{recipe.servings}</p>
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg flex items-center gap-3">
              <Heart className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-sm font-medium">Сложность</h3>
                <p className="text-sm text-muted-foreground capitalize">{recipe.difficulty}</p>
              </div>
            </div>
          </div>

          {/* Карточка автора */}
          {author && <div className="mt-8"><AuthorCard author={author} /></div>}

          {/* Ингредиенты */}
          <section className="bg-card p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Ингредиенты</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-base">{ingredient}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Инструкция */}
          <section className="bg-card p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Инструкция</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="flex gap-4 p-4 bg-background rounded-lg">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <p className="text-base">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </Container>
    </article>
  );
} 