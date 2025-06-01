import { useState, useCallback, useRef } from 'react';
import SearchService from '@/services/search.service';
import { handleApiError } from '@/utils/errorHandler';
import { SearchContext } from '@/context/SearchContext';

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

    // Основной поиск (сброс offset)
    const performSearch = useCallback(async (query) => {
        setSearchLoading(true);
        setSearchError(null);
        setOffset(0);
        setHasMore(true);
        try {
            const result = await SearchService.searchRecipes(query, {}, 0, limit);
            setSearchResults(result.data);
            setSearchTotalCount(result.totalCount);
            setSearchQuery(query);
            setOffset(result.data.length);
            setHasMore(result.data.length < result.totalCount);
            lastQueryRef.current = query;
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
        }
    }, []);

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
                setOffset(prevOffset => {
                    const currentOffset = prevOffset;
                    SearchService.searchRecipes(lastQueryRef.current, {}, currentOffset, limit).then(result => {
                        setSearchResults(prev => {
                            const existingIds = new Set(prev.map(r => r.id));
                            const uniqueNewRecipes = result.data.filter(r => !existingIds.has(r.id));
                            return [...prev, ...uniqueNewRecipes];
                        });
                        const newOffset = currentOffset + result.data.length;
                        if (result.data.length === 0) {
                            setHasMore(false);
                        } else {
                            setHasMore(newOffset < result.totalCount);
                        }
                        setOffset(newOffset);
                        setSearchTotalCount(result.totalCount);
                        setSearchLoading(false);
                        loadingRef.current = false;
                    }).catch(error => {
                        const { message } = handleApiError(error);
                        setSearchError(message);
                        setHasMore(false);
                        setSearchLoading(false);
                        loadingRef.current = false;
                    });
                    return currentOffset;
                });
            } catch (error) {
                setSearchLoading(false);
                loadingRef.current = false;
            }
        }, 300);
    }, [hasMore, limit]);

    const clearSearchResults = useCallback(() => {
        setSearchResults([]);
        setSearchTotalCount(0);
        setSearchQuery('');
        setSearchError(null);
        setOffset(0);
        setHasMore(true);
        lastQueryRef.current = '';
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
            clearSearchResults,
            loadMore,
            hasMore
        }}>
            {children}
        </SearchContext.Provider>
    );
}; 