"use client"

import { useEffect, useState } from "react"
import RecipesService from "@/services/recipes.service"
import { RecipeContext } from "@/context/RecipeContext"
import S3Service from "@/services/s3.service"
import { useAuth } from "@/context/AuthContext"

export default function RecipeProvider({ children }) {
    const { loading: authLoading } = useAuth()
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [hasMore, setHasMore] = useState(true)
    const [offset, setOffset] = useState(0)
    const [totalCount, setTotalCount] = useState(0)
    const LIMIT = 9

    const fetchRecipes = async (resetExisting = false) => {
        try {
            setLoading(true)
            
            const currentOffset = resetExisting ? 0 : offset
            
            const { data, totalCount } = await RecipesService.getPaginatedRecipes(currentOffset, LIMIT)

            setTotalCount(totalCount)
            
            const newOffset = resetExisting ? data.length : currentOffset + data.length;
            const moreAvailable = newOffset < totalCount;
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
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Ждём завершения инициализации аутентификации перед загрузкой рецептов
        if (!authLoading) {
            fetchRecipes(true)
        }
    }, [authLoading])

    const getRecipeBySlug = async (slug, source='feed') => {
        try {
            setLoading(true)

            return await RecipesService.getRecipeBySlug(slug, source);
        } catch (error) {
            setError(error);
            console.error("Ошибка при загрузке рецепта:", error);
            throw error
        } finally {
            setLoading(false)
        }
    };

    const addRecipe = async (formData) => {
        try {
            const newRecipe = {
                title: formData.title,
                short_description: formData.short_description,
                difficulty: formData.difficulty,
                cook_time_minutes: formData.cook_time_minutes,
                tags: formData.tags.map(tag => ({ name: tag })),
                ingredients: formData.ingredients
            };
    
            const recipe = await RecipesService.addRecipe(newRecipe);
    
            const mainPhotoPresigned = await RecipesService.getUploadImageUrl(recipe.id);
            await S3Service.uploadImage(mainPhotoPresigned, formData.main_photo);
    
            let presignedPostDatas = [];
            const stepsWithPhotos = formData.instructions
                .filter(instruction => instruction.photo !== null && instruction.photo !== undefined)
                .map(instruction => instruction.step_number);
    
            if (stepsWithPhotos.length > 0) {
                try {
                    presignedPostDatas = await RecipesService.getUploadInstructionsUrls(
                        recipe.id, 
                        stepsWithPhotos
                    );
    
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
                    throw error;
                }
            }
    
            const instructions = formData.instructions.map(instruction => {
                const presignedData = presignedPostDatas.find(
                    item => item.step_number === instruction.step_number
                );
    
                return {
                    step_number: instruction.step_number,
                    description: instruction.description,
                    image_path: presignedData?.fields?.key || null
                };
            });
    
            const recipeWithPhotos = {
                id: recipe.id,
                image_path: mainPhotoPresigned.fields.key,
                instructions: instructions
            };
    
            await RecipesService.updateRecipe(recipeWithPhotos);

            await RecipesService.updateRecipe({
                id: recipe.id,
                is_published: true
            });
    
            return recipeWithPhotos;
    
        } catch (error) {
            console.error("Ошибка при добавлении рецепта:", error);
            throw error;
        }
    };

    const getRecipesByAuthorId = async (authorId) => {
        try {
            return await RecipesService.getPaginatedRecipesByUsername(authorId);
        } catch (error) {
            setError(error);
            console.error("Ошибка при загрузке рецептов автора:", error);
            return [];
        }
    };

    const deleteRecipe = async (recipeId) => {
        try {
            await RecipesService.deleteRecipe(recipeId);

            setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));

            setTotalCount(prev => Math.max(0, prev - 1));

            return true;
        } catch (error) {
            console.error("Ошибка при удалении рецепта:", error);
            throw error;
        }
    };

    const isFile = v => v && typeof v === 'object' && (v instanceof File || v.constructor?.name === 'File');

    const updateRecipe = async (formData) => {
        try {
            // 1. Обновляем основные поля
            const updatedRecipe = {
                id: formData.id,
                title: formData.title,
                short_description: formData.short_description,
                difficulty: formData.difficulty,
                cook_time_minutes: formData.cook_time_minutes,
                tags: formData.tags.map(tag => ({ name: tag })),
                ingredients: formData.ingredients,
            };

            console.log(formData);
            

            // 2. Фото блюда
            let mainPhotoKey = formData.image_path;
            if (isFile(formData.main_photo)) {
                const mainPhotoPresigned = await RecipesService.getUploadImageUrl(formData.id);
                await S3Service.uploadImage(mainPhotoPresigned, formData.main_photo);
                mainPhotoKey = mainPhotoPresigned.fields.key;
            }
            // 3. Фото шагов
            let presignedPostDatas = [];
            const stepsWithPhotos = formData.instructions
                .map((inst, idx) => ({ ...inst, idx }))
                .filter(inst => isFile(inst.photo))
                .map(inst => inst.step_number);
            if (stepsWithPhotos.length > 0) {
                presignedPostDatas = await RecipesService.getUploadInstructionsUrls(formData.id, stepsWithPhotos);
                await Promise.all(
                    presignedPostDatas.map(async (presignedData) => {
                        const instruction = formData.instructions.find(
                            inst => inst.step_number === presignedData.step_number
                        );
                        if (isFile(instruction?.photo)) {
                            await S3Service.uploadImage(presignedData, instruction.photo);
                        }
                    })
                );
            }
            // 4. Формируем массив инструкций с image_path
            const instructions = formData.instructions.map(instruction => {
                const presignedData = presignedPostDatas.find(
                    item => item.step_number === instruction.step_number
                );
                return {
                    step_number: instruction.step_number,
                    description: instruction.description,
                    image_path: presignedData?.fields?.key || instruction.image_path || null
                };
            });
            // 5. Собираем финальный объект для PATCH
            const recipeWithPhotos = {
                ...updatedRecipe,
                image_path: mainPhotoKey,
                instructions,
            };
            const updated = await RecipesService.updateRecipe(recipeWithPhotos);
            setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r));
            return updated;
        } catch (error) {
            setError(error);
            throw error;
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
                getRecipeBySlug,
                addRecipe,
                getRecipesByAuthorId,
                deleteRecipe,
                updateRecipe
            }}
        >
            {children}
        </RecipeContext.Provider>
    )
}