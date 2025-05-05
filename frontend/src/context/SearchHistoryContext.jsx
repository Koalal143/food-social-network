import { createContext, useContext } from 'react';

export const SearchHistoryContext = createContext();

export const useSearchHistory = () => useContext(SearchHistoryContext)