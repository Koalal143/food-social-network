"use client"

import { useState, useEffect } from "react";
import { SearchHistoryContext } from "@/context/SearchHistoryContext";
import SearchHistoryService from "@/services/search-history.service";
import { useAuth } from '@/context/AuthContext';

const LOCALSTORAGE_KEY = "cookie_consent_accepted";

export default function SearchHistoryProvider({ children }) {
    const [searchHistory, setSearchHistory] = useState([]);
    const { user } = useAuth();

    // Вспомогательная функция для проверки согласия на куки
    const hasConsentForCookies = () => {
      const consent = localStorage.getItem(LOCALSTORAGE_KEY);
      return consent === '1';
    };

    const addToHistory = (query) => {
      // Не добавляем пустые запросы в историю
      if (!query || !query.trim()) {
        return;
      }

      // Проверяем согласие на куки перед добавлением в историю
      if (!hasConsentForCookies()) {
        console.log('История поиска не сохраняется: пользователь не дал согласие на использование куки');
        return;
      }

      const trimmedQuery = query.trim();

      setSearchHistory((prev) => {
        // Фильтруем пустые элементы и добавляем новый запрос
        const filteredHistory = prev.filter(item => {
          if (!item) return false;

          // Поддерживаем как строки, так и объекты с полем query
          const itemQuery = typeof item === 'string' ? item : item.query;
          return itemQuery && itemQuery.trim() && itemQuery !== trimmedQuery;
        });
        const newHistory = [trimmedQuery, ...filteredHistory].slice(0, 5);
        return newHistory;
      });

      // Сохраняем в историю на сервере только если есть согласие
      SearchHistoryService.addSearch(trimmedQuery);
    };
  
    // Загрузка истории поиска при изменении пользователя
    useEffect(() => {
      // Проверяем согласие на куки перед загрузкой истории
      if (!hasConsentForCookies()) {
        setSearchHistory([]); // Очищаем историю если нет согласия
        return;
      }

      SearchHistoryService.getLastFiveSearches()
        .then(history => {
          // Фильтруем пустые запросы при загрузке
          const filteredHistory = history.filter(item => {
            if (!item) return false;

            // Поддерживаем как строки, так и объекты с полем query
            const itemQuery = typeof item === 'string' ? item : item.query;
            return itemQuery && itemQuery.trim();
          });
          setSearchHistory(filteredHistory);
        })
        .catch(error => {
          console.error('Ошибка при загрузке истории поиска:', error);
          setSearchHistory([]);
        });
    }, [user]);

    // Слушатель изменений согласия на куки
    useEffect(() => {
      const handleStorageChange = (e) => {
        if (e.key === LOCALSTORAGE_KEY) {
          if (e.newValue !== '1') {
            // Если согласие отозвано, очищаем историю
            setSearchHistory([]);
          } else {
            // Если согласие дано, загружаем историю
            SearchHistoryService.getLastFiveSearches()
              .then(history => {
                const filteredHistory = history.filter(item => {
                  if (!item) return false;
                  const itemQuery = typeof item === 'string' ? item : item.query;
                  return itemQuery && itemQuery.trim();
                });
                setSearchHistory(filteredHistory);
              })
              .catch(error => {
                console.error('Ошибка при загрузке истории поиска:', error);
                setSearchHistory([]);
              });
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
      <SearchHistoryContext.Provider value={{ searchHistory, addToHistory }}>
        {children}
      </SearchHistoryContext.Provider>
    );
}