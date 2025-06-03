import { createContext, useContext } from "react";

export const SearchContext = createContext(null);

export const useSearch = () => {
    const context = useContext(SearchContext)
    if (!context) {
        throw new Error('useSearch must be used within an SearchProvider')
    }
    return context
}