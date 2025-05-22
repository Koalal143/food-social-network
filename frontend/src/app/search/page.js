"use client"

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import { useSearchHistory } from '@/context/SearchHistoryContext';
import { useRecipes } from '@/context/RecipeContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RecipesList from '@/components/shared/RecipesList';
import { useSearch } from '@/providers/SearchProvider';
import { SearchProvider } from '@/providers/SearchProvider';

export default function SearchPage() {
  const router = useRouter();
  const { searchHistory, addToHistory } = useSearchHistory();
  const { searchResults, searchLoading, searchError, searchQuery: contextSearchQuery, performSearch } = useSearch();

  console.log("Search Results:", searchResults);

  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q');
  const debouncedQuery = useDebounce(urlQuery, 300);

  const handleBack = () => {
    router.push('/');
  };

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
      addToHistory(debouncedQuery);
    } else {
      performSearch('');
    }
  }, [debouncedQuery, performSearch, addToHistory]);

  return (
    <SearchProvider>
      <Container className="py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Button>

          {!urlQuery && searchHistory.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Недавние запросы</h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => router.push(`/search?q=${encodeURIComponent(item)}`)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {searchLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : searchError ? (
            <div className="text-center py-12 text-red-500">
              <p className="text-xl">Ошибка при выполнении поиска:</p>
              <p>{searchError}</p>
            </div>
          ) : contextSearchQuery && searchResults && searchResults.length > 0 ? (
            <RecipesList recipes={searchResults}/>
          ) : contextSearchQuery && searchResults ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                По запросу "{contextSearchQuery}" ничего не найдено
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                Введите запрос для поиска рецептов
              </p>
            </div>
          )}
        </div>
      </Container>
    </SearchProvider>
  );
} 