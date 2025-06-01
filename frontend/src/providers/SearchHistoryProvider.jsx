"use client"

import { useState, useEffect } from "react";
import { SearchHistoryContext } from "@/context/SearchHistoryContext";
import SearchHistoryService from "@/services/search-history.service";

export default function SearchHistoryProvider({ children }) {
    const [searchHistory, setSearchHistory] = useState([]);
  
    const addToHistory = (query) => {
      setSearchHistory((prev) => {
        const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
        return newHistory;
      });

      SearchHistoryService.addSearch(query)
    };
  
    useEffect(() => {
      SearchHistoryService.getLastFiveSearches().then(setSearchHistory)
    }, [])

    return (
      <SearchHistoryContext.Provider value={{ searchHistory, addToHistory }}>
        {children}
      </SearchHistoryContext.Provider>
    );
}