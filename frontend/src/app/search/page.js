"use client"

import { useEffect, useCallback, Suspense } from 'react';
import Container from '@/components/layout/Container';
import { useSearchHistory } from '@/context/SearchHistoryContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, AlertCircle } from 'lucide-react';
import InfiniteRecipesList from '@/components/shared/InfiniteRecipeList';
import { useSearch } from '@/context/SearchContext';
import SearchFilters from '@/components/ui/search/SearchFilters';
import { SearchLoadingSkeleton } from '@/components/ui/skeletons';
import EmptyState, { EmptyStateVariants } from '@/components/ui/EmptyState';

function SearchPageContent() {
  const router = useRouter();
  const { searchHistory } = useSearchHistory();
  const { searchResults, searchLoading, searchError, searchQuery, performSearch, loadMore, hasMore, updateFilters, clearSearchResults, filters } = useSearch();

  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q');
  const debouncedQuery = useDebounce(urlQuery, 300);

  const handleBack = () => {
    router.push('/');
  };

  const updateFiltersCallback = useCallback((newFilters) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim()) {
      performSearch(debouncedQuery.trim());
    } else if (debouncedQuery === '') {
      // Очищаем результаты когда запрос пустой (например, при переходе на /search без параметров)
      clearSearchResults();
    }
  }, [debouncedQuery]); // Убираем performSearch из зависимостей чтобы избежать бесконечных циклов

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

        <SearchFilters filters={filters} onChange={updateFiltersCallback} />

        {!urlQuery && searchHistory && searchHistory.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Недавние запросы</h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item, index) => {
                // Поддерживаем как объекты с query, так и строки
                const query = typeof item === 'string' ? item : item.query;
                const key = typeof item === 'string' ? `${query}-${index}` : item.id || `${query}-${index}`;

                // Не показываем пустые запросы
                if (!query || !query.trim()) {
                  return null;
                }

                return (
                  <Button
                    key={key}
                    variant="outline"
                    onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
                    className="text-sm"
                  >
                    {query}
                  </Button>
                );
              }).filter(Boolean)}
            </div>
          </div>
        )}

        {searchLoading && searchResults.length === 0 ? (
          <SearchLoadingSkeleton />
        ) : searchError ? (
          <EmptyState
            icon={AlertCircle}
            title="Что-то пошло не так"
            description={`Ошибка при выполнении поиска: ${searchError}`}
            theme="error"
            actionText="Попробовать снова"
            actionOnClick={() => window.location.reload()}
          />
        ) : searchQuery && searchResults && searchResults.length > 0 ? (
          <InfiniteRecipesList
            recipes={searchResults}
            loading={searchLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            source="search"
          />
        ) : searchQuery && searchResults ? (
          <EmptyState
            icon={Search}
            {...EmptyStateVariants.noSearchResults}
            description={`По запросу "${searchQuery}" ничего не найдено. Попробуйте другие ключевые слова или проверьте правописание.`}
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Найдите свой идеальный рецепт"
            description="Введите название блюда в поисковую строку выше"
            theme="search"
          />
        )}
      </div>
    </Container>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}