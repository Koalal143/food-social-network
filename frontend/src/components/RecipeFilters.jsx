'use client';

import { useState } from 'react';

const RecipeFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    cookingTime: 'all',
    difficulty: 'all',
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-card p-6 rounded-lg mb-8">
      <h3 className="text-lg font-medium mb-4">Фильтры</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Время приготовления
          </label>
          <select
            value={filters.cookingTime}
            onChange={(e) => handleFilterChange('cookingTime', e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background"
          >
            <option value="all">Все рецепты</option>
            <option value="quick">До 30 минут</option>
            <option value="medium">30-60 минут</option>
            <option value="long">Более 60 минут</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Сложность
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background"
          >
            <option value="all">Любая сложность</option>
            <option value="Легко">Легко</option>
            <option value="Средне">Средне</option>
            <option value="Сложно">Сложно</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RecipeFilters; 