"use client"

import { useEffect } from 'react';
import Container from '@/components/layout/Container';
import { useSearchHistory } from '@/context/SearchHistoryContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import InfiniteRecipesList from '@/components/shared/InfiniteRecipeList';
import { useSearch } from '@/context/SearchContext';
import SearchFilters from '@/components/ui/search/SearchFilters';

export default function SearchPage() {
  const router = useRouter();
  const { searchHistory, addToHistory } = useSearchHistory();
  const { searchResults, searchLoading, searchError, searchQuery, performSearch, loadMore, hasMore, updateFilters } = useSearch();

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
  }, [debouncedQuery, addToHistory]);

  return (
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

        <SearchFilters filters={{}} onChange={updateFilters} />

        {!urlQuery && searchHistory.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Недавние запросы</h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  onClick={() => router.push(`/search?q=${encodeURIComponent(item.query)}`)}
                >
                  {item.query}
                </Button>
              ))}
            </div>
          </div>
        )}

        {searchLoading && searchResults.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : searchError ? (
          <div className="text-center py-12 text-red-500">
            <p className="text-xl">Ошибка при выполнении поиска:</p>
            <p>{searchError}</p>
          </div>
        ) : searchQuery && searchResults && searchResults.length > 0 ? (
          <InfiniteRecipesList
            recipes={searchResults}
            loading={searchLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            source="search"
          />
        ) : searchQuery && searchResults ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              По запросу "{searchQuery}" ничего не найдено
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
  );
} 