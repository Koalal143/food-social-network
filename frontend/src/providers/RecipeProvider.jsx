"use client"

import { useEffect, useState } from "react"
import RecipesService from "@/services/recipes.service"
import { RecipeContext } from "@/context/RecipeContext"
import S3Service from "@/services/s3.service"

export default function RecipeProvider({ children }) {
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [hasMore, setHasMore] = useState(true)
    const [offset, setOffset] = useState(0)
    const [totalCount, setTotalCount] = useState(0)
    const LIMIT = 10

    const fetchRecipes = async (resetExisting = false) => {
        try {
            setLoading(true)
            
            const currentOffset = resetExisting ? 0 : offset
            
            const { data, totalCount } = await RecipesService.getPaginatedRecipes(currentOffset, LIMIT)
            console.log('Received data:', { data: data.length, totalCount, currentOffset });
            
            setTotalCount(totalCount)
            
            const newOffset = resetExisting ? LIMIT : currentOffset + LIMIT;
            const moreAvailable = newOffset < totalCount;
            console.log('More available?', { newOffset, totalCount, moreAvailable });
            setHasMore(moreAvailable);
            
            setRecipes(prev => {
                if (resetExisting) return data;

                const existingIds = prev.map(recipe => recipe.id);
                
                const uniqueNewRecipes = data.filter(recipe => !existingIds.includes(recipe.id));
                
                return [...prev, ...uniqueNewRecipes];
            });
            
            setOffset(newOffset);
        } catch (error) {
            setError(error)
            console.error("Ошибка при загрузке рецептов:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRecipes(true)
    }, [])

    const getRecipeById = async (id) => {
        try {
            return await RecipesService.getRecipeById(id);
        } catch (error) {
            setError(error);
            console.error("Ошибка при загрузке рецепта:", error);
            return null;
        }
    };

    const addRecipe = async (formData) => {
        try {
            // 1. Создаем базовый объект рецепта
            const newRecipe = {
                title: formData.title,
                short_description: formData.short_description,
                difficulty: formData.difficulty,
                cook_time_minutes: formData.cook_time_minutes,
                tags: [{ name: "Dinner" }],
                ingredients: formData.ingredients
            };
    
            // 2. Создаем рецепт в базе данных
            const recipe = await RecipesService.addRecipe(newRecipe);
    
            // 3. Загружаем основное фото
            const mainPhotoPresigned = await RecipesService.getUploadImageUrl(recipe.id);
            await S3Service.uploadImage(mainPhotoPresigned, formData.main_photo[0]);
    
            // 4. Обработка фото для шагов инструкций
            let presignedPostDatas = []; // Объявляем переменную в общей области видимости
            const stepsWithPhotos = formData.instructions
                .filter(instruction => instruction.photo !== null && instruction.photo !== undefined)
                .map(instruction => instruction.step_number);
    
            if (stepsWithPhotos.length > 0) {
                try {
                    presignedPostDatas = await RecipesService.getUploadInstructionsUrls(
                        recipe.id, 
                        stepsWithPhotos
                    );
    
                    // Параллельная загрузка изображений шагов
                    await Promise.all(
                        presignedPostDatas.map(async (presignedData) => {
                            const instruction = formData.instructions.find(
                                inst => inst.step_number === presignedData.step_number
                            );
                            
                            if (instruction?.photo) {
                                await S3Service.uploadImage(presignedData, instruction.photo);
                            }
                        })
                    );
                } catch (error) {
                    console.error('Ошибка при загрузке изображений шагов:', error);
                    // Дополнительная логика: откат создания рецепта при необходимости
                    throw error;
                }
            }
    
            // 5. Формируем инструкции с URL изображений
            const instructions = formData.instructions.map(instruction => {
                const presignedData = presignedPostDatas.find(
                    item => item.step_number === instruction.step_number
                );
    
                return {
                    step_number: instruction.step_number,
                    description: instruction.description,
                    image_url: presignedData?.fields?.key || null // Безопасный доступ к полям
                };
            });
    
            // 6. Обновляем рецепт с финальными данными
            const recipeWithPhotos = {
                id: recipe.id,
                image_url: mainPhotoPresigned.fields.key, // Используем ключ из presigned данных
                instructions: instructions
            };
    
            await RecipesService.updateRecipe(recipeWithPhotos);
    
            return recipeWithPhotos;
    
        } catch (error) {
            console.error("Ошибка при добавлении рецепта:", error);
            // Дополнительные действия: очистка ресурсов, уведомление пользователя
            throw error; // Пробрасываем ошибку для обработки в UI
        }
    };

    const getRecipesByAuthorId = async (authorId) => {
        try {
            return await RecipesService.getRecipesByAuthorId(authorId);
        } catch (error) {
            setError(error);
            console.error("Ошибка при загрузке рецептов автора:", error);
            return [];
        }
    };

    return (
        <RecipeContext.Provider
            value={{
                recipes,
                loading,
                error,
                hasMore,
                totalCount,
                fetchRecipes,
                getRecipeById,
                addRecipe,
                getRecipesByAuthorId
            }}
        >
            {children}
        </RecipeContext.Provider>
    )
}