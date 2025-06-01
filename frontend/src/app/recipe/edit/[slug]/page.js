"use client";

import React from "react";
import Container from "@/components/layout/Container";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EditRecipeForm from "@/components/shared/forms/EditRecipeForm";

export default function AddRecipePage({ params }) {
    const { slug } = React.use(params);


    return (
        <ProtectedRoute>
        <div className="py-8">
            <Container>
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold tracking-tight">Изменить рецепт</h1>
                <EditRecipeForm slug={slug}/>
            </div>
            </Container>
        </div>
        </ProtectedRoute>
    );
}
