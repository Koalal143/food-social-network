"use client"

import { useState } from "react";
import { SearchHistoryContext } from "@/context/SearchHistoryContext";

export default function SearchHistoryProvider({ children }) {
    const [searchHistory, setSearchHistory] = useState([]);
  
    const addToHistory = (query) => {
      setSearchHistory((prev) => {
        const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
        return newHistory;
      });
    };
  
    return (
      <SearchHistoryContext.Provider value={{ searchHistory, addToHistory }}>
        {children}
      </SearchHistoryContext.Provider>
    );
}