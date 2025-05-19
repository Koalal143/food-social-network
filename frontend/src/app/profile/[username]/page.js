"use client"

import React, { useEffect, useState, useCallback, useRef } from "react";
import Container from "@/components/layout/Container";
import { useRecipes } from "@/context/RecipeContext";
import Loader from "@/components/ui/Loader";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import CopyLinkButton from "@/components/ui/CopyLinkButton"
import NotFound from "@/app/not-found";
import InfiniteRecipesList from "@/components/shared/InfiniteRecipeList";
import RecipesService from "@/services/recipes.service";

const RECIPES_PER_PAGE = 9;

export default function ProfileIdPage({ params }) {
    const { username } = React.use(params);
    const { loading: globalLoading } = useRecipes();
    const { getUserByUsername } = useUser();

    const [user, setUser] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [offset, setOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    
    const loadingRef = useRef(false);

    const debounceTimerRef = useRef(null);

    const fetchInitialData = useCallback(async () => {
        if (loadingRef.current) return;
        
        try {
            loadingRef.current = true;
            setIsLoading(true);
            
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
    }, [username, getUserByUsername]);

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
                setIsLoading(true);
                
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
                    
                    return [...prev, ...uniqueNewRecipes];
                });
                
                setOffset(prev => prev + newRecipes.length);
                
                setHasMore(recipes.length + newRecipes.length < (result.totalCount || 0));
                
            } catch (err) {
                console.error("Error loading more recipes:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
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

    if (globalLoading) {
        return <Loader />;
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
        <Container className="py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Image
                        src={user.profile?.avatar_url || '/images/user-dummy.svg'}
                        alt={user.username}
                        width={120} 
                        height={120}
                        priority
                        unoptimized={true}
                        className="w-24 h-24 rounded-full mr-4 bg-secondary"
                    />
                    <div>
                        <h3 className="text-xl font-semibold">{user.username}</h3>
                        <p className="text-gray-600">{user.profile.about}</p>
                    </div>
                </div>
                <CopyLinkButton 
                    link={`${window.location.origin}/profile/${username}`}
                    tooltipText="Скопировать ссылку на профиль"
                />
            </div>
            <h3 className="text-lg font-bold mb-4">Рецепты ({totalCount})</h3>
            <InfiniteRecipesList 
                recipes={recipes}
                loading={isLoading}
                hasMore={hasMore}
                onLoadMore={loadMoreRecipes}
            />
            
            {recipes.length === 0 && !isLoading && (
                <div className="text-center py-12 text-gray-500">
                    У этого пользователя пока нет рецептов
                </div>
            )}
        </Container>
    );
}