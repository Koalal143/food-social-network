"use client";
import React from "react";
import { useEffect, useState } from "react";
import Container from "@/components/Container";
import RecipesService from "@/services/recipes.service";
import { useRouter } from "next/navigation";

const RecipePage = ({ params }) => {
    const router = useRouter();
    const { id } = React.use(params);
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const data = await RecipesService.getReceiptById(Number(id));
                if (data) {
                    setRecipe(data);
                } else {
                    console.error("Рецепт не найден");
                }
            } catch (error) {
                console.error("Ошибка при загрузке рецепта:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id]);

    if (loading) {
        return <Container className="py-6 animate-pulse">Загрузка...</Container>;
    }

    if (!recipe) {
        return <Container className="py-6">Рецепт не найден.</Container>;
    }

    return (
        <Container className="py-8">
            <button 
                onClick={() => router.back()}
                className="mb-6 text-blue-600 hover:text-blue-800 transition-colors"
            >
                ← Назад
            </button>
            
            <div 
                className="max-w-4xl mx-auto"
            >
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <img
                        src={recipe.preview}
                        alt={recipe.title}
                        className="w-full h-96 object-cover"
                    />
                    
                    <div className="p-6">
                        <h1 className="text-3xl font-bold mb-4 text-gray-800">{recipe.title}</h1>
                        <p className="text-lg text-gray-600 mb-6">{recipe.shortDescription}</p>
                        
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
            </div>
        </Container>
    );
};

export default RecipePage;