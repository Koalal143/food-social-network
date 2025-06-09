"use client";
import { useRef, useEffect, useCallback } from "react";

/**
 * Хук для реализации бесконечной прокрутки
 * @param {Function} onLoadMore - функция для загрузки дополнительных данных
 * @param {boolean} hasMore - есть ли еще данные для загрузки
 * @param {boolean} loading - идет ли загрузка в данный момент
 * @param {Object} options - дополнительные опции
 * @returns {Object} - объект с ref для элемента-триггера
 */
export function useInfiniteScroll(onLoadMore, hasMore, loading, options = {}) {
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    const {
        threshold = parseFloat(process.env.NEXT_PUBLIC_INFINITE_SCROLL_THRESHOLD) || 0.1,
        rootMargin = process.env.NEXT_PUBLIC_INFINITE_SCROLL_ROOT_MARGIN || '100px',
        debounceDelay = parseInt(process.env.NEXT_PUBLIC_DEBOUNCE_DELAY) || 300
    } = options;

    // Дебаунс для предотвращения множественных вызовов
    const debouncedLoadMore = useCallback(
        debounce(onLoadMore, debounceDelay),
        [onLoadMore, debounceDelay]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    debouncedLoadMore();
                }
            },
            { threshold, rootMargin }
        );

        if (loadMoreRef.current && hasMore) {
            observer.observe(loadMoreRef.current);
        }

        observerRef.current = observer;

        return () => {
            if (observerRef.current && loadMoreRef.current) {
                observerRef.current.unobserve(loadMoreRef.current);
            }
        };
    }, [loading, hasMore, debouncedLoadMore, threshold, rootMargin]);

    return { loadMoreRef };
}

/**
 * Утилита для дебаунса функций
 * @param {Function} func - функция для дебаунса
 * @param {number} delay - задержка в миллисекундах
 * @returns {Function} - дебаунсированная функция
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Хук для автообновления данных
 * @param {Function} refreshFunction - функция для обновления данных
 * @param {number} interval - интервал обновления в миллисекундах
 * @param {boolean} enabled - включено ли автообновление
 */
export function useAutoRefresh(refreshFunction, interval, enabled = true) {
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!enabled || !refreshFunction) return;

        const refreshInterval = interval || 
            parseInt(process.env.NEXT_PUBLIC_SHOPPING_LIST_SYNC_INTERVAL) || 
            30000;

        intervalRef.current = setInterval(refreshFunction, refreshInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [refreshFunction, interval, enabled]);

    const stopAutoRefresh = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startAutoRefresh = useCallback(() => {
        if (!intervalRef.current && enabled && refreshFunction) {
            const refreshInterval = interval || 
                parseInt(process.env.NEXT_PUBLIC_SHOPPING_LIST_SYNC_INTERVAL) || 
                30000;
            intervalRef.current = setInterval(refreshFunction, refreshInterval);
        }
    }, [refreshFunction, interval, enabled]);

    return { stopAutoRefresh, startAutoRefresh };
}
