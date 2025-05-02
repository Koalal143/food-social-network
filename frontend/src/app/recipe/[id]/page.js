"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { useRecipes } from "@/context/RecipeContext";
import { useUsers } from "@/context/UserContext";
import Loader from "@/components/ui/Loader";
import Image from "next/image";
import Link from "next/link";
import AuthorCard from "@/components/shared/AuthorCard";

export default function RecipePage({ params }) {
  const router = useRouter();
  const { getRecipeById } = useRecipes();
  const { getUserById } = useUsers();
  const [recipe, setRecipe] = useState(null);
  const [author, setAuthor] = useState(null);
  const { id } = React.use(params);

  useEffect(() => {
      const fetchData = async () => {
          const recipeData = await getRecipeById(Number(id));
          if (recipeData) {
              setRecipe(recipeData);
              const authorData = await getUserById(recipeData.authorId);
              setAuthor(authorData);
          }
      };
      fetchData();
  }, [id, getRecipeById, getUserById]);

  if (!recipe) {
      return <Loader />;
  }

  return (
    <article className="py-8">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-[16/9] mb-8">
            <Image
              src={recipe.preview}
              alt={recipe.title}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>

          <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
          <p className="text-lg text-muted-foreground mb-8">{recipe.description}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-medium mb-2">Время приготовления</h3>
              <p>{recipe.time}</p>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-medium mb-2">Порций</h3>
              <p>{recipe.servings}</p>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-medium mb-2">Сложность</h3>
              <p>{recipe.difficulty}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Ингредиенты</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              {author && (
                <AuthorCard author={author}/>
              )}

              <h2 className="text-2xl font-bold mb-4">Инструкция приготовления</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex space-x-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </Container>
    </article>
  );
} 