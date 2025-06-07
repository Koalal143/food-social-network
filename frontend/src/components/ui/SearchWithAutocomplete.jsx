"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Компонент поиска с автодополнением и улучшенным UX
 */
export default function SearchWithAutocomplete({
    value,
    onChange,
    onSearch,
    onSuggestionSelect,
    placeholder = "Поиск рецептов...",
    suggestions = [],
    recentSearches = [],
    popularSearches = [],
    isLoading = false,
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    
    const debouncedValue = useDebounce(value, 300);

    // Закрытие при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target) &&
                !inputRef.current?.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Обработка клавиш
    const handleKeyDown = useCallback((e) => {
        if (!isOpen) return;

        const allSuggestions = [
            ...suggestions,
            ...recentSearches.map(s => ({ text: s, type: 'recent' })),
            ...popularSearches.map(s => ({ text: s, type: 'popular' }))
        ];

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev < allSuggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev > 0 ? prev - 1 : allSuggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && allSuggestions[highlightedIndex]) {
                    handleSuggestionClick(allSuggestions[highlightedIndex]);
                } else if (value.trim()) {
                    handleSearch();
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    }, [isOpen, highlightedIndex, suggestions, recentSearches, popularSearches, value]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        onChange(newValue);
        setIsOpen(true);
        setHighlightedIndex(-1);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const handleSuggestionClick = (suggestion) => {
        const searchText = typeof suggestion === 'string' ? suggestion : suggestion.text;
        onChange(searchText);
        setIsOpen(false);
        setHighlightedIndex(-1);
        
        if (onSuggestionSelect) {
            onSuggestionSelect(suggestion);
        } else {
            onSearch(searchText);
        }
    };

    const handleSearch = () => {
        if (value.trim()) {
            onSearch(value.trim());
            setIsOpen(false);
        }
    };

    const clearSearch = () => {
        onChange('');
        inputRef.current?.focus();
    };

    const renderSuggestionGroup = (items, title, icon: Icon, type) => {
        if (!items.length) return null;

        return (
            <div className="py-2">
                <div className="flex items-center space-x-2 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Icon className="w-3 h-3" />
                    <span>{title}</span>
                </div>
                {items.map((item, index) => {
                    const text = typeof item === 'string' ? item : item.text;
                    const globalIndex = suggestions.length + 
                        (type === 'recent' ? 0 : recentSearches.length) + index;
                    
                    return (
                        <motion.button
                            key={`${type}-${index}`}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                                highlightedIndex === globalIndex ? 'bg-gray-50' : ''
                            }`}
                            onClick={() => handleSuggestionClick(item)}
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.1 }}
                        >
                            <span className="text-sm">{text}</span>
                        </motion.button>
                    );
                })}
            </div>
        );
    };

    const showDropdown = isOpen && (
        suggestions.length > 0 || 
        recentSearches.length > 0 || 
        popularSearches.length > 0 ||
        value.length === 0
    );

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="pl-10 pr-10"
                />
                {value && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                        <X className="w-3 h-3" />
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                    >
                        {isLoading && (
                            <div className="flex items-center justify-center py-4">
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="ml-2 text-sm text-muted-foreground">Поиск...</span>
                            </div>
                        )}

                        {!isLoading && (
                            <>
                                {/* Suggestions */}
                                {suggestions.length > 0 && (
                                    <div className="py-2">
                                        {suggestions.map((suggestion, index) => (
                                            <motion.button
                                                key={index}
                                                className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                                                    highlightedIndex === index ? 'bg-gray-50' : ''
                                                }`}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                whileHover={{ x: 4 }}
                                                transition={{ duration: 0.1 }}
                                            >
                                                <span className="text-sm font-medium">{suggestion.text || suggestion}</span>
                                                {suggestion.count && (
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        ({suggestion.count} рецептов)
                                                    </span>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {/* Recent searches */}
                                {renderSuggestionGroup(
                                    recentSearches, 
                                    'Недавние поиски', 
                                    Clock, 
                                    'recent'
                                )}

                                {/* Popular searches */}
                                {renderSuggestionGroup(
                                    popularSearches, 
                                    'Популярные запросы', 
                                    TrendingUp, 
                                    'popular'
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
