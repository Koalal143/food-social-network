"use client"

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { useEffect, useState } from "react";

/**
 * Компонент для отображения информации о рекомендуемом размере фотографий
 * Адаптивный - тултип на десктопе, текст под полем на мобиле
 */
export default function PhotoUploadInfo({ 
    recommendedSize, 
    maxFileSize = "5MB", 
    formats = "JPG, PNG, GIF",
    className = ""
}) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const infoText = `Рекомендуемый размер: ${recommendedSize}. Максимальный размер файла: ${maxFileSize}. Форматы: ${formats}`;

    if (isMobile) {
        return (
            <div className={`text-xs text-muted-foreground mt-1 ${className}`}>
                <div className="flex items-start gap-1">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{infoText}</span>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button 
                        type="button" 
                        className={`text-muted-foreground hover:text-primary transition-colors ${className}`}
                    >
                        <Info className="w-4 h-4" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm">{infoText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
