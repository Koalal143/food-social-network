import { useState, useCallback, useRef } from 'react';
import SearchService from '@/services/search.service';
import { handleApiError } from '@/utils/errorHandler';
import { SearchContext } from '@/context/SearchContext';
import { useSearchHistory } from '@/context/SearchHistoryContext';

export const SearchProvider = ({ children }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTotalCount, setSearchTotalCount] = useState(0);
    const [offset, setOffset] = useState(0);
    const limit = 10; // Можно вынести в пропсы или константу
    const [hasMore, setHasMore] = useState(true);
    const lastQueryRef = useRef('');
    const loadingRef = useRef(false);
    const debounceTimerRef = useRef(null);
    
    // Новое состояние для фильтров
    const [filters, setFilters] = useState({
        includeIngredients: [],
        excludeIngredients: [],
        tags: [],
        cookTimeFrom: null,
        cookTimeTo: null,
        sortBy: ''
    });

    const { addToHistory } = useSearchHistory();

    // Основной поиск (сброс offset)
    const performSearch = useCallback(async (query) => {
        // Предотвращаем повторные вызовы с тем же запросом
        if (loadingRef.current && lastQueryRef.current === query) {
            return;
        }

        setSearchLoading(true);
        setSearchError(null);
        setOffset(0);
        setHasMore(true);
        loadingRef.current = true;

        // Если запрос пустой, очищаем результаты и не выполняем поиск
        if (!query || !query.trim()) {
            setSearchResults([]);
            setSearchTotalCount(0);
            setSearchQuery('');
            setHasMore(false);
            lastQueryRef.current = '';
            setSearchLoading(false);
            loadingRef.current = false;
            return { data: [], totalCount: 0 };
        }

        const trimmedQuery = query.trim();

        try {
            const result = await SearchService.searchRecipes(trimmedQuery, filters, 0, limit);
            setSearchResults(result.data);
            setSearchTotalCount(result.totalCount);
            setSearchQuery(trimmedQuery);
            setOffset(result.data.length);
            setHasMore(result.data.length > 0 &&
                      result.data.length < result.totalCount &&
                      result.data.length === limit);
            lastQueryRef.current = trimmedQuery;

            // Добавляем в историю только непустые запросы
            addToHistory(trimmedQuery);
            return result;
        } catch (error) {
            const { message } = handleApiError(error);
            setSearchError(message);
            setSearchResults([]);
            setSearchTotalCount(0);
            setHasMore(false);
            throw error;
        } finally {
            setSearchLoading(false);
            loadingRef.current = false;
        }
    }, [filters, addToHistory]);

    // Функция для обновления фильтров
    const updateFilters = useCallback((newFilters) => {
        setFilters(newFilters);
        // Перезапускаем поиск с новыми фильтрами только если есть запрос
        if (searchQuery && searchQuery.trim()) {
            performSearch(searchQuery);
        }
    }, [searchQuery, performSearch]);

    // Догрузка следующей страницы с защитой от повторов и debounce
    const loadMore = useCallback(() => {
        if (loadingRef.current || !hasMore) return;
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(async () => {
            if (loadingRef.current || !hasMore) return;
            loadingRef.current = true;
            setSearchLoading(true);
            setSearchError(null);

            try {
                // Получаем текущий offset напрямую из состояния
                const currentOffset = offset;

                const result = await SearchService.searchRecipes(lastQueryRef.current, filters, currentOffset, limit);

                setSearchResults(prev => {
                    const existingIds = new Set(prev.map(r => r.id));
                    const uniqueNewRecipes = result.data.filter(r => !existingIds.has(r.id));
                    return [...prev, ...uniqueNewRecipes];
                });

                const newOffset = currentOffset + result.data.length;
                setOffset(newOffset);
                setSearchTotalCount(result.totalCount);

                // Если получили меньше данных чем запрашивали, или достигли общего количества
                if (result.data.length === 0 ||
                    newOffset >= result.totalCount ||
                    result.data.length < limit) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

            } catch (error) {
                const { message } = handleApiError(error);
                setSearchError(message);
                setHasMore(false);
            } finally {
                setSearchLoading(false);
                loadingRef.current = false;
            }
        }, 300);
    }, [hasMore, limit, filters, offset]);

    const clearSearchResults = useCallback(() => {
        setSearchResults([]);
        setSearchTotalCount(0);
        setSearchQuery('');
        setSearchError(null);
        setSearchLoading(false);
        setOffset(0);
        setHasMore(true);
        lastQueryRef.current = '';
        loadingRef.current = false;
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
    }, []);

    return (
        <SearchContext.Provider value={{
            searchResults,
            searchLoading,
            searchError,
            searchQuery,
            searchTotalCount,
            performSearch,
            updateFilters,
            clearSearchResults,
            loadMore,
            hasMore
        }}>
            {children}
        </SearchContext.Provider>
    );
}; 