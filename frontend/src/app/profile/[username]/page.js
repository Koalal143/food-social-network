"use client"

import React, { useEffect, useState, useCallback, useRef } from "react";
import Container from "@/components/layout/Container";
import { AuthorProfileSkeleton } from "@/components/ui/skeletons";
import { useUser } from "@/context/UserContext";
import CopyLinkButton from "@/components/ui/CopyLinkButton"
import NotFound from "@/app/not-found";
import InfiniteRecipesList from "@/components/shared/InfiniteRecipeList";
import RecipesService from "@/services/recipes.service";
import AuthorProfileCard from "@/components/ui/profile/AuthorProfileCard";

const RECIPES_PER_PAGE = 9;

export default function ProfileIdPage({ params }) {
    const { username } = React.use(params);
    const { getUserByUsername, users } = useUser();

    const [user, setUser] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [offset, setOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    
    const loadingRef = useRef(false);

    const debounceTimerRef = useRef(null);

    const fetchInitialData = useCallback(async () => {
        if (loadingRef.current) return;

        try {
            loadingRef.current = true;

            // Проверяем кэш пользователя сначала
            const cachedUser = users[username];
            if (cachedUser) {
                setUser(cachedUser);
                setIsLoading(false);
            }

            const authorData = await getUserByUsername(username);
            setUser(authorData);

            const result = await RecipesService.getPaginatedRecipesByUsername(username, 0, RECIPES_PER_PAGE);

            setRecipes(result.data || []);
            setTotalCount(result.totalCount || 0);
            setHasMore((result.data?.length || 0) > 0 && (result.data?.length || 0) < (result.totalCount || 0));
            setOffset(RECIPES_PER_PAGE);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
            loadingRef.current = false;
        }
    }, [username, getUserByUsername, users]);

    const loadMoreRecipes = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(async () => {
            if (loadingRef.current || !hasMore || recipes.length >= totalCount) {
                return;
            }
            
            try {
                loadingRef.current = true;
                setIsLoadingMore(true);

                console.log(`Loading more recipes at offset ${offset}`);

                const result = await RecipesService.getPaginatedRecipesByUsername(username, offset, RECIPES_PER_PAGE);
                const newRecipes = result.data || [];

                if (newRecipes.length === 0) {
                    setHasMore(false);
                    return;
                }

                setRecipes(prev => {
                    const existingIds = new Set(prev.map(r => r.id));
                    const uniqueNewRecipes = newRecipes.filter(r => !existingIds.has(r.id));
                    const newRecipesList = [...prev, ...uniqueNewRecipes];

                    // Обновляем hasMore на основе нового количества рецептов
                    setHasMore(newRecipesList.length < (result.totalCount || 0) && newRecipes.length > 0);

                    return newRecipesList;
                });


                setOffset(prev => prev + newRecipes.length);

            } catch (err) {
                console.error("Error loading more recipes:", err);
                setError(err.message);
            } finally {
                setIsLoadingMore(false);
                loadingRef.current = false;
            }
        }, 300);
    }, [username, offset, recipes.length, totalCount, hasMore]);

    useEffect(() => {
        fetchInitialData();
        
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [fetchInitialData]);

    if (isLoading) {
        return (
            <Container className="py-8">
                <AuthorProfileSkeleton />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-6">
                <div className="text-center text-red-500">
                    <p>Произошла ошибка при загрузке данных: {error}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-primary text-white rounded"
                        onClick={() => {
                            setError(null);
                            fetchInitialData();
                        }}
                    >
                        Попробовать снова
                    </button>
                </div>
            </Container>
        );
    }

    if (!user) {
        return <NotFound />;
    }

    return (
        <Container className="py-8">
            <div className="space-y-8">
                {/* Профиль автора */}
                <AuthorProfileCard
                    user={user}
                    totalRecipes={totalCount}
                />

                {/* Рецепты */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Рецепты {totalCount > 0 && (
                                <span className="text-muted-foreground font-normal">({totalCount})</span>
                            )}
                        </h2>
                        <CopyLinkButton
                            link={`${window.location.origin}/profile/${username}`}
                            tooltipText="Скопировать ссылку на профиль"
                        />
                    </div>

                    <InfiniteRecipesList
                        recipes={recipes}
                        loading={isLoadingMore}
                        hasMore={hasMore}
                        onLoadMore={loadMoreRecipes}
                        source="author-page"
                    />

                    {recipes.length === 0 && !isLoading && (
                        <div className="text-center py-16">
                            <div className="space-y-3">
                                <div className="w-16 h-16 mx-auto bg-secondary/60 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-muted-foreground">
                                    У этого пользователя пока нет рецептов
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    Возможно, они скоро поделятся своими кулинарными шедеврами
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
}