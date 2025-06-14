"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EditRecipeForm from "@/components/shared/forms/EditRecipeForm";
import { useRecipes } from "@/context/RecipeContext";
import { HeaderSkeleton, RecipeFormSkeleton } from "@/components/ui/skeletons";

export default function EditRecipePage({ params }) {
    const { slug } = React.use(params);
    const { getRecipeBySlug } = useRecipes();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const data = await getRecipeBySlug(slug, null);
            } catch (error) {
                console.error("Ошибка при загрузке рецепта:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();        
    }, [slug]);

    return (
        <ProtectedRoute skeleton="form">
            <div className="py-8">
                <Container>
                    <div className="max-w-3xl mx-auto space-y-8">
                        {loading ? (
                            <>
                                <HeaderSkeleton level={1} width="w-1/3" />
                                <RecipeFormSkeleton />
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Изменить рецепт
                                </h1>
                                <EditRecipeForm slug={slug} />
                            </>
                        )}
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}
