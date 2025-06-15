'use client';

import { useMemo } from 'react';
import RecipePreviewCard from './RecipePreviewCard';

export default function RecipePreview({
  formData,
  mainPhotoPreview,
  isVisible = true
}) {
  const previewRecipe = useMemo(() => {
    if (!formData) return null;

    return {
      id: 'preview',
      slug: 'preview',
      title: formData.title || 'Название рецепта',
      short_description: formData.short_description || 'Описание рецепта',
      image_url: mainPhotoPreview || '/images/image-dummy.svg',
      cook_time_minutes: formData.cook_time_minutes > 0 ? formData.cook_time_minutes : 30,
      difficulty: formData.difficulty || 'MEDIUM',
      is_on_favorites: false,
      author: {
        username: 'preview'
      }
    };
  }, [formData, mainPhotoPreview]);

  if (!isVisible || !previewRecipe) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="bg-white/20 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/30 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl"></div>
        <div className="relative z-10">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Превью рецепта</h3>
          <div className="pointer-events-none select-none">
            <RecipePreviewCard
              recipe={previewRecipe}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
