import { createContext, useContext, useState, useCallback } from 'react';
import SearchService from '@/services/search.service';
import { handleApiError } from '@/utils/errorHandler';

const SearchContext = createContext(null);

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTotalCount, setSearchTotalCount] = useState(0);

    const performSearch = useCallback(async (query, offset = 0, limit = 10) => {
        setSearchLoading(true);
        setSearchError(null);
        try {
            const result = await SearchService.searchRecipes(query, offset, limit);
            setSearchResults(prev => offset === 0 ? result.data : [...prev, ...result.data]);
            setSearchTotalCount(result.totalCount);
            setSearchQuery(query); // Сохраняем текущий запрос
            return result; // Возвращаем результат для возможной пагинации на странице поиска
        } catch (error) {
            const { message } = handleApiError(error);
            setSearchError(message);
            console.error("Ошибка при выполнении поиска:", error);
            throw error; // Пробрасываем ошибку дальше
        } finally {
            setSearchLoading(false);
        }
    }, []);

    const clearSearchResults = useCallback(() => {
        setSearchResults([]);
        setSearchTotalCount(0);
        setSearchQuery('');
        setSearchError(null);
    }, []);

    return (
        <SearchContext.Provider value={{
            searchResults,
            searchLoading,
            searchError,
            searchQuery,
            searchTotalCount,
            performSearch,
            clearSearchResults
        }}>
            {children}
        </SearchContext.Provider>
    );
}; 