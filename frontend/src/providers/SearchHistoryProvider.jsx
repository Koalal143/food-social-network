"use client"

import { useState, useEffect } from "react";
import { SearchHistoryContext } from "@/context/SearchHistoryContext";
import SearchHistoryService from "@/services/search-history.service";
import { useAuth } from '@/context/AuthContext';

const LOCALSTORAGE_KEY = "cookie_consent_accepted";

export default function SearchHistoryProvider({ children }) {
    const [searchHistory, setSearchHistory] = useState([]);
    const { user } = useAuth();
  
    const addToHistory = (query) => {
      setSearchHistory((prev) => {
        const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
        return newHistory;
      });

      SearchHistoryService.addSearch(query)
    };
  
    useEffect(() => {
      const consent = localStorage.getItem(LOCALSTORAGE_KEY);
      
      if (consent !== '1') return;
      SearchHistoryService.getLastFiveSearches().then(setSearchHistory)
    }, [user])

    return (
      <SearchHistoryContext.Provider value={{ searchHistory, addToHistory }}>
        {children}
      </SearchHistoryContext.Provider>
    );
}