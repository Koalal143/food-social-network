"use client"

import React, { useEffect, useState } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import Container from "@/components/layout/Container";
import { useRecipes } from "@/context/RecipeContext";
import { RecipeDetailSkeleton } from "@/components/ui/skeletons";
import Image from "next/image";
import AuthorCard from "@/components/ui/recipe-page/AuthorCard";
import { Bookmark, Clock, Heart, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CopyLinkButton from "@/components/ui/CopyLinkButton";
import RecipeInfoCards from "@/components/ui/recipe-page/RecipeInfoCards";
import RecipeIngridients from "@/components/ui/recipe-page/RecipeIngridients";
import RecipeInstruction from "@/components/ui/recipe-page/RecipeInstruction";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandler";
import NotFound from "@/app/not-found";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import DeleteRecipeDialog from "@/components/shared/recipeActions/DeleteRecipeDialog";

export default function RecipePage({ params }) {
    const { getRecipeBySlug, error, loading } = useRecipes();
    const { addFavorite, removeFavorite, favorites } = useFavorites();
    const [recipe, setRecipe] = useState(null);
    const { toast } = useToast()
    const [isSaved, setIsSaved] = useState(false);
    const { isAuth, user } = useAuth();
    const [isImageLoading, setIsImageLoading] = useState(true);
    
    const { slug } = React.use(params);
    const searchParams = useSearchParams();
    const source = searchParams.get('source');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recipeData = await getRecipeBySlug(slug, source);
                if (recipeData) {
                    setRecipe(recipeData);
                    setIsSaved(favorites.includes(recipeData.id));
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
    }, [slug, favorites]);

    const canDeleteRecipe = () => {
        if (!user || !recipe) return false;
        return user.id === recipe.author.id || user.is_superuser;
    };

    const handleSave = () => {
        if (!isAuth) {
            toast({
                variant: "default",
                title: "Требуется авторизация",
                description: "Чтобы сохранять рецепты, пожалуйста, войдите в систему",
            });
            return;
        }

        if (isSaved) {
            removeFavorite(recipe.id);
            toast({
                variant: "default",
                title: "Рецепт удален",
                description: "Рецепт был удален из ваших сохраненных",
            });
        } else {
            addFavorite(recipe.id);
            toast({
                variant: "default",
                title: "Рецепт сохранен",
                description: "Теперь вы можете найти его в разделе 'Избранное'",
            });
        }
        setIsSaved(!isSaved);
    };

    if (loading) {
        return (
            <Container>
                <div className="py-8">
                    <RecipeDetailSkeleton />
                </div>
            </Container>
        )
    }

    if (error) {
        return <NotFound />
    }

    if (!recipe) {
        return (
            <Container>
                <div className="py-8">
                    <RecipeDetailSkeleton />
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <article className="py-8">
                <div className="max-w-3xl mx-auto bg-white dark:bg-secondary/100 rounded-3xl shadow-xl overflow-hidden">
                    {/* Image with action buttons */}
                    <div className="relative aspect-[16/9] w-full">
                        <Image
                            src={recipe.image_url || '/images/image-dummy.svg'}
                            alt={recipe.title}
                            fill
                            className={`object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                            priority
                            unoptimized={true}
                            onLoadingComplete={() => setIsImageLoading(false)}
                        />
                        {isImageLoading && (
                            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-4 right-4 flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="bg-white/90 dark:bg-background/90 backdrop-blur rounded-full hover:bg-white dark:hover:bg-background shadow-md hover:scale-105 transition-transform"
                                onClick={handleSave}
                                aria-label={isSaved ? "Удалить из избранного" : "Добавить в избранное"}
                            >
                                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-primary stroke-primary' : ''} ${!isAuth && 'text-gray-500'}`} />
                            </Button>
                            <CopyLinkButton
                                link={`${window.location.origin}/recipe/${recipe.slug}?source=shared`}
                                tooltipText="Скопировать ссылку на рецепт"
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="bg-white/90 dark:bg-background/90 backdrop-blur rounded-full hover:bg-white dark:hover:bg-background shadow-md hover:scale-105 transition-transform"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </Button>
                                }
                            />
                            {canDeleteRecipe() && (
                                <DeleteRecipeDialog
                                    recipe={recipe}
                                    trigger={
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="bg-destructive/90 backdrop-blur rounded-full hover:bg-destructive shadow-md hover:scale-105 transition-transform"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    }
                                />
                            )}
                        </div>
                    </div>

                    {/* Recipe Content */}
                    <div className="p-8 space-y-8">
                        {/* Заголовок и описание */}
                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold tracking-tight overflow-wrap break-word word-break break-all">{recipe.title}</h1>
                            <p className="text-lg text-muted-foreground overflow-wrap break-word word-break break-all">
                                {recipe.short_description}
                            </p>
                        </div>

                        {/* Author card */}
                        <AuthorCard author={recipe.author} />

                        {/* Recipe info cards */}
                        <RecipeInfoCards recipe={recipe} />

                        {/* Ingredients */}
                        <RecipeIngridients recipe={recipe} />

                        {/* Instructions */}
                        <RecipeInstruction recipe={recipe} />
                    </div>
                </div>
            </article>
        </Container>
    );
}