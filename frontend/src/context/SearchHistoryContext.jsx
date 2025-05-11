import { createContext, useContext } from 'react';

export const SearchHistoryContext = createContext();

export const useSearchHistory = () => {
    const context = useContext(SearchHistoryContext)
    if (!context) {
        throw new Error('useSearchHistory must be used within an SearchHistoryProvider')
    }
    return context
}