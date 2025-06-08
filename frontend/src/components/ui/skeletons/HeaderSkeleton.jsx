"use client"

/**
 * Скелетон для заголовков разных размеров
 */
export default function HeaderSkeleton({ 
    level = 1, 
    width = "w-3/4", 
    className = "",
    animated = true 
}) {
    const getHeightClass = () => {
        switch (level) {
            case 1: return "h-8 md:h-10"; // h1
            case 2: return "h-7 md:h-8";  // h2
            case 3: return "h-6 md:h-7";  // h3
            case 4: return "h-5 md:h-6";  // h4
            case 5: return "h-4 md:h-5";  // h5
            case 6: return "h-4";         // h6
            default: return "h-6";
        }
    };

    const baseClasses = `bg-gray-200 rounded ${width} ${getHeightClass()}`;
    const animationClass = animated ? "animate-pulse" : "";
    
    return (
        <div className={`${baseClasses} ${animationClass} ${className}`} />
    );
}

/**
 * Скелетон для группы заголовков (заголовок + подзаголовок)
 */
export function HeaderGroupSkeleton({ 
    titleLevel = 1, 
    titleWidth = "w-3/4",
    subtitleLevel = 3,
    subtitleWidth = "w-1/2",
    spacing = "space-y-2",
    className = "",
    animated = true 
}) {
    return (
        <div className={`${spacing} ${className}`}>
            <HeaderSkeleton 
                level={titleLevel} 
                width={titleWidth} 
                animated={animated}
            />
            <HeaderSkeleton 
                level={subtitleLevel} 
                width={subtitleWidth} 
                animated={animated}
            />
        </div>
    );
}

/**
 * Скелетон для заголовка страницы с описанием
 */
export function PageHeaderSkeleton({ 
    className = "",
    animated = true 
}) {
    return (
        <div className={`space-y-3 ${className}`}>
            {/* Основной заголовок */}
            <HeaderSkeleton 
                level={1} 
                width="w-2/3" 
                animated={animated}
            />
            {/* Описание */}
            <div className="space-y-2">
                <div className={`h-4 bg-gray-200 rounded w-full ${animated ? 'animate-pulse' : ''}`} />
                <div className={`h-4 bg-gray-200 rounded w-3/4 ${animated ? 'animate-pulse' : ''}`} />
            </div>
        </div>
    );
}

/**
 * Скелетон для заголовка секции
 */
export function SectionHeaderSkeleton({ 
    withAction = false,
    className = "",
    animated = true 
}) {
    return (
        <div className={`flex items-center justify-between ${className}`}>
            <HeaderSkeleton 
                level={2} 
                width="w-48" 
                animated={animated}
            />
            {withAction && (
                <div className={`h-8 bg-gray-200 rounded w-24 ${animated ? 'animate-pulse' : ''}`} />
            )}
        </div>
    );
}

/**
 * Скелетон для заголовка карточки
 */
export function CardHeaderSkeleton({ 
    withSubtitle = false,
    className = "",
    animated = true 
}) {
    return (
        <div className={`space-y-2 ${className}`}>
            <HeaderSkeleton 
                level={3} 
                width="w-3/4" 
                animated={animated}
            />
            {withSubtitle && (
                <div className={`h-3 bg-gray-200 rounded w-1/2 ${animated ? 'animate-pulse' : ''}`} />
            )}
        </div>
    );
}
