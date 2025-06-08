"use client"

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './button';
import { motion } from 'framer-motion';

/**
 * Умная пагинация с предзагрузкой и улучшенным UX
 */
export default function SmartPagination({
    currentPage,
    totalPages,
    onPageChange,
    onPreload,
    siblingCount = 1,
    showFirstLast = true,
    className = ""
}) {
    const [preloadedPages, setPreloadedPages] = useState(new Set());

    // Предзагрузка соседних страниц
    const preloadPage = useCallback((page) => {
        if (
            page > 0 && 
            page <= totalPages && 
            !preloadedPages.has(page) && 
            onPreload
        ) {
            setPreloadedPages(prev => new Set([...prev, page]));
            onPreload(page);
        }
    }, [totalPages, preloadedPages, onPreload]);

    // Предзагружаем соседние страницы при изменении текущей
    useEffect(() => {
        const pagesToPreload = [];
        
        // Предзагружаем следующую страницу
        if (currentPage < totalPages) {
            pagesToPreload.push(currentPage + 1);
        }
        
        // Предзагружаем предыдущую страницу
        if (currentPage > 1) {
            pagesToPreload.push(currentPage - 1);
        }

        pagesToPreload.forEach(page => {
            setTimeout(() => preloadPage(page), 100);
        });
    }, [currentPage, totalPages, preloadPage]);

    // Генерация массива страниц для отображения
    const getPageNumbers = () => {
        const pages = [];
        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

        if (showFirstLast) {
            // Всегда показываем первую страницу
            if (leftSiblingIndex > 1) {
                pages.push(1);
                if (shouldShowLeftDots) {
                    pages.push('...');
                }
            }
        }

        // Добавляем страницы в диапазоне
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
            pages.push(i);
        }

        if (showFirstLast) {
            // Всегда показываем последнюю страницу
            if (rightSiblingIndex < totalPages) {
                if (shouldShowRightDots) {
                    pages.push('...');
                }
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const handlePageClick = (page) => {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const pageNumbers = getPageNumbers();

    if (totalPages <= 1) return null;

    return (
        <nav className={`flex items-center justify-center space-x-1 ${className}`}>
            {/* Previous button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center space-x-1"
            >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Назад</span>
            </Button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
                {pageNumbers.map((page, index) => {
                    if (page === '...') {
                        return (
                            <div key={`dots-${index}`} className="px-2">
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </div>
                        );
                    }

                    const isActive = page === currentPage;
                    const isPreloaded = preloadedPages.has(page);

                    return (
                        <motion.div
                            key={page}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageClick(page)}
                                className={`relative min-w-[40px] ${
                                    isActive ? 'shadow-md' : ''
                                } ${
                                    isPreloaded && !isActive ? 'border-green-200 bg-green-50' : ''
                                }`}
                                onMouseEnter={() => preloadPage(page)}
                            >
                                {page}
                                {isPreloaded && !isActive && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                                )}
                            </Button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Next button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1"
            >
                <span className="hidden sm:inline">Далее</span>
                <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Page info */}
            <div className="hidden md:flex items-center text-sm text-muted-foreground ml-4">
                Страница {currentPage} из {totalPages}
            </div>
        </nav>
    );
}

/**
 * Хук для управления пагинацией с предзагрузкой
 */
export function usePagination({
    initialPage = 1,
    pageSize = 10,
    totalItems = 0,
    onPageChange,
    preloadEnabled = true
}) {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [preloadCache, setPreloadCache] = useState(new Map());
    
    const totalPages = Math.ceil(totalItems / pageSize);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        if (onPageChange) {
            onPageChange(page);
        }
    }, [onPageChange]);

    const handlePreload = useCallback(async (page) => {
        if (!preloadEnabled || preloadCache.has(page)) return;

        try {
            // Здесь должна быть логика предзагрузки данных
            // Например, вызов API для получения данных страницы
            const data = await onPageChange?.(page, true); // true означает предзагрузку
            
            setPreloadCache(prev => new Map([...prev, [page, data]]));
        } catch (error) {
            console.warn(`Failed to preload page ${page}:`, error);
        }
    }, [preloadEnabled, preloadCache, onPageChange]);

    const getPreloadedData = (page) => {
        return preloadCache.get(page);
    };

    const clearPreloadCache = () => {
        setPreloadCache(new Map());
    };

    return {
        currentPage,
        totalPages,
        handlePageChange,
        handlePreload,
        getPreloadedData,
        clearPreloadCache,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
    };
}
