"use client"

import { cn } from "@/lib/utils"

/**
 * Компонент для оптимизации touch-взаимодействий на мобильных устройствах
 */
export function TouchOptimized({ 
    children, 
    className, 
    minTouchTarget = 44, // минимальный размер области касания в пикселях
    ...props 
}) {
    return (
        <div 
            className={cn(
                "touch-manipulation select-none",
                `min-h-[${minTouchTarget}px] min-w-[${minTouchTarget}px]`,
                "flex items-center justify-center",
                className
            )}
            style={{
                minHeight: `${minTouchTarget}px`,
                minWidth: `${minTouchTarget}px`,
            }}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * Контейнер для мобильной сетки
 */
export function MobileGrid({ 
    children, 
    className,
    cols = 1,
    gap = 4,
    ...props 
}) {
    const gridClasses = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
    }

    const gapClasses = {
        2: "gap-2",
        3: "gap-3", 
        4: "gap-4",
        6: "gap-6",
        8: "gap-8",
    }

    return (
        <div 
            className={cn(
                "grid",
                gridClasses[cols] || "grid-cols-1",
                gapClasses[gap] || "gap-4",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * Адаптивный контейнер для кнопок
 */
export function ResponsiveButtonGroup({ 
    children, 
    className,
    orientation = "horizontal", // horizontal | vertical
    ...props 
}) {
    return (
        <div 
            className={cn(
                "flex gap-2",
                orientation === "horizontal" 
                    ? "flex-col sm:flex-row" 
                    : "flex-col",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * Адаптивный текст с оптимизированными размерами для мобильных
 */
export function ResponsiveText({ 
    children, 
    className,
    size = "base", // xs | sm | base | lg | xl | 2xl | 3xl
    weight = "normal", // normal | medium | semibold | bold
    ...props 
}) {
    const sizeClasses = {
        xs: "text-xs md:text-xs",
        sm: "text-sm md:text-sm", 
        base: "text-base md:text-sm",
        lg: "text-lg md:text-base",
        xl: "text-xl md:text-lg",
        "2xl": "text-2xl md:text-xl",
        "3xl": "text-3xl md:text-2xl",
    }

    const weightClasses = {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold", 
        bold: "font-bold",
    }

    return (
        <span 
            className={cn(
                sizeClasses[size] || sizeClasses.base,
                weightClasses[weight] || weightClasses.normal,
                className
            )}
            {...props}
        >
            {children}
        </span>
    )
}

/**
 * Адаптивная карточка с оптимизированными отступами
 */
export function ResponsiveCard({ 
    children, 
    className,
    padding = "default", // compact | default | spacious
    ...props 
}) {
    const paddingClasses = {
        compact: "p-3 md:p-4",
        default: "p-4 md:p-6", 
        spacious: "p-6 md:p-8",
    }

    return (
        <div 
            className={cn(
                "rounded-lg border bg-card text-card-foreground shadow-sm",
                paddingClasses[padding] || paddingClasses.default,
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * Хук для определения мобильного устройства
 */
export function useIsMobile() {
    if (typeof window === 'undefined') return false
    
    return window.innerWidth < 768
}

/**
 * Утилиты для адаптивных классов
 */
export const responsive = {
    // Отступы
    padding: {
        sm: "p-2 md:p-3",
        md: "p-3 md:p-4", 
        lg: "p-4 md:p-6",
        xl: "p-6 md:p-8",
    },
    
    // Размеры текста
    text: {
        xs: "text-xs md:text-xs",
        sm: "text-sm md:text-sm",
        base: "text-base md:text-sm", 
        lg: "text-lg md:text-base",
        xl: "text-xl md:text-lg",
        "2xl": "text-2xl md:text-xl",
        "3xl": "text-3xl md:text-2xl",
    },
    
    // Размеры иконок
    icon: {
        sm: "w-4 h-4 md:w-3.5 md:h-3.5",
        md: "w-5 h-5 md:w-4 md:h-4",
        lg: "w-6 h-6 md:w-5 md:h-5",
        xl: "w-8 h-8 md:w-6 md:h-6",
    },
    
    // Высота элементов
    height: {
        input: "h-10 md:h-9",
        button: "h-10 md:h-9", 
        card: "min-h-[120px] md:min-h-[100px]",
    },
    
    // Промежутки
    gap: {
        sm: "gap-2 md:gap-2",
        md: "gap-3 md:gap-4",
        lg: "gap-4 md:gap-6",
        xl: "gap-6 md:gap-8",
    }
}
