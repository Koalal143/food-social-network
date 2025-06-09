"use client"

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/**
 * Компонент для отображения предупреждений об актуальности ингредиентов
 * @param {Object} props
 * @param {Object} props.item - элемент списка покупок
 * @param {boolean} props.item.is_actual - актуальность ингредиента
 * @param {Object|null} props.item.recipe - информация о рецепте
 * @param {string} props.className - дополнительные CSS классы
 */
export default function IngredientActualityWarning({ item, className }) {
    const [isMobileTooltipOpen, setIsMobileTooltipOpen] = useState(false)

    const shouldShowWarning = item.is_actual === false
    
    if (!shouldShowWarning) {
        return null
    }

    const getWarningInfo = () => {
        if (item.recipe === null || item.recipe === undefined) {
            return {
                type: 'deleted',
                message: 'Будьте внимательны: рецепт, к которому привязан этот ингредиент, был удален',
                severity: 'high'
            }
        } else if (item.recipe && typeof item.recipe === 'object') {
            if (Object.keys(item.recipe).length === 0) {
                return {
                    type: 'deleted',
                    message: 'Будьте внимательны: рецепт, к которому привязан этот ингредиент, был удален',
                    severity: 'high'
                }
            }

            return {
                type: 'modified',
                message: 'Пожалуйста, просмотрите рецепт, так как его ингредиенты были изменены',
                severity: 'medium'
            }
        }

        return null
    }

    const warningInfo = getWarningInfo()
    
    if (!warningInfo) {
        return null
    }

    const handleMobileClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsMobileTooltipOpen(!isMobileTooltipOpen)
    }

    const iconClasses = cn(
        "w-4 h-4 cursor-help transition-colors",
        {
            'text-red-500 hover:text-red-600': warningInfo.severity === 'high',
            'text-amber-500 hover:text-amber-600': warningInfo.severity === 'medium'
        },
        className
    )

    return (
        <div className="relative">
            {/* Десктопная версия с Tooltip */}
            <div className="hidden sm:block">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center">
                                <AlertCircle className={iconClasses} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent 
                            side="top" 
                            className="max-w-xs text-sm"
                            sideOffset={5}
                        >
                            <p>{warningInfo.message}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Мобильная версия с кликабельным tooltip */}
            <div className="sm:hidden">
                <button
                    onClick={handleMobileClick}
                    className="flex items-center p-1 -m-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Показать предупреждение"
                >
                    <AlertCircle className={iconClasses} />
                </button>
                
                {isMobileTooltipOpen && (
                    <>
                        {/* Overlay для закрытия при клике вне */}
                        <div 
                            className="fixed inset-0 z-40"
                            onClick={() => setIsMobileTooltipOpen(false)}
                        />
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                            <div className={cn(
                                "px-3 py-2 text-sm rounded-lg shadow-lg border max-w-xs",
                                "bg-white text-gray-900 border-gray-200",
                                "before:content-[''] before:absolute before:top-full before:left-1/2",
                                "before:transform before:-translate-x-1/2 before:border-4",
                                "before:border-transparent before:border-t-white"
                            )}>
                                <p className="text-center">{warningInfo.message}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
