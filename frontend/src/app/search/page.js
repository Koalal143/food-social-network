"use client";

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import { useSearchHistory } from '@/context/SearchHistoryContext';
import RecipeCard from '@/components/shared/RecipeCard';
import { useRecipes } from '@/context/RecipeContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RecipesList from '@/components/layout/RecipesList';

export default function SearchPage() {
  const router = useRouter();
  const { searchHistory, addToHistory } = useSearchHistory();
  const { recipes } = useRecipes();
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const debouncedQuery = useDebounce(query, 300);

  const handleBack = () => {
    router.push('/search');
    router.push('/');
  };

  useEffect(() => {
    if (debouncedQuery) {
      handleSearch(debouncedQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  const handleSearch = async (query) => {
    if (!query?.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      addToHistory(query);

      const results = recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(query.toLowerCase()) ||
        recipe.shortDescription.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(results);
    } catch (err) {
      toast({
        title: "Ошибка поиска",
        description: "Попробуйте повторить попытку позже",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

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

        {!query && searchHistory.length > 0 && (
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

        {isSearching ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : query && searchResults.length > 0 ? (
          <RecipesList recipes={searchResults}/>
        ) : query ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              По вашему запросу ничего не найдено
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