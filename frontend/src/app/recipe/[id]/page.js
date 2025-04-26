"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { useRecipes } from "@/context/RecipeContext";
import { useUsers } from "@/context/UserContext";
import Loader from "@/components/ui/Loader";
import Image from "next/image";

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
        <Container className="py-8 min-h-screen">
            <button 
                onClick={() => router.back()}
                className="mb-6 text-blue-600 hover:text-blue-800 transition-colors"
            >
                ← Назад
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                        src={recipe.preview}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">{recipe.title}</h1>
                    <p className="text-lg text-gray-600 mb-6">{recipe.shortDescription}</p>
                    
                    {author && (
                        <div className="flex items-center mb-6">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                                <Image
                                    src={author.avatar}
                                    alt={author.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Автор рецепта</p>
                                <p className="font-medium">{author.name}</p>
                            </div>
                        </div>
                    )}

                    <div className="border-t border-b py-6 my-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Ингредиенты:</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recipe.ingredients.map((ingredient, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    <span className="text-gray-700">{ingredient}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="prose max-w-none">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Приготовление:</h2>
                        <p className="text-gray-700 whitespace-pre-line">{recipe.recipe}</p>
                    </div>
                </div>
            </div>
        </Container>
    );
}