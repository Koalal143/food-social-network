'use client'

import Container from '@/components/layout/Container';
import AddRecipeForm from '@/components/shared/AddRecipeForm';

export default function AddRecipePage() {
  return (
    <div className="py-8">
      <Container>
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold tracking-tight">Добавить рецепт</h1>
          <AddRecipeForm />
        </div>
      </Container>
    </div>
  );
} 