"use client"

import { motion } from "framer-motion";
import { X, Hash } from "lucide-react";
import { useState } from "react";

/**
 * Улучшенный компонент для отображения тегов
 * Более привлекательный дизайн с анимациями
 */
export default function TagBadge({
    children,
    variant = "default", // "default", "primary", "secondary", "outline", "gradient"
    size = "md", // "sm", "md", "lg"
    removable = false,
    onRemove,
    className = "",
    animated = true,
    icon = false
}) {
    const sizeClasses = {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-sm", 
        lg: "px-4 py-2 text-base"
    };

    const variantClasses = {
        default: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200",
        primary: "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20",
        secondary: "bg-secondary/60 text-secondary-foreground hover:bg-secondary/80 border border-secondary",
        outline: "bg-transparent text-gray-600 hover:bg-gray-50 border border-gray-300",
        gradient: "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary hover:from-primary/20 hover:to-secondary/20 border border-primary/20"
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-3.5 h-3.5",
        lg: "w-4 h-4"
    };

    const content = (
        <span className={`
            inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200
            ${sizeClasses[size]} ${variantClasses[variant]} ${className}
        `}>
            {icon && <Hash className={iconSizes[size]} />}
            <span className="truncate">{children}</span>
            {removable && (
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove?.();
                    }}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                >
                    <X className={iconSizes[size]} />
                </motion.button>
            )}
        </span>
    );

    if (animated) {
        return (
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="inline-block"
            >
                {content}
            </motion.div>
        );
    }

    return content;
}

/**
 * Компонент группы тегов
 */
export function TagGroup({ 
    tags, 
    variant = "default",
    size = "md",
    removable = false,
    onRemove,
    maxVisible = null,
    className = "",
    animated = true
}) {
    const visibleTags = maxVisible ? tags.slice(0, maxVisible) : tags;
    const hiddenCount = maxVisible && tags.length > maxVisible ? tags.length - maxVisible : 0;

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {visibleTags.map((tag, index) => (
                <motion.div
                    key={typeof tag === 'string' ? tag : tag.id || index}
                    initial={animated ? { opacity: 0, y: 10 } : {}}
                    animate={animated ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                    <TagBadge
                        variant={variant}
                        size={size}
                        removable={removable}
                        onRemove={() => onRemove?.(typeof tag === 'string' ? tag : tag.id || index)}
                        animated={animated}
                    >
                        {typeof tag === 'string' ? tag : tag.name || tag.label}
                    </TagBadge>
                </motion.div>
            ))}
            
            {hiddenCount > 0 && (
                <motion.div
                    initial={animated ? { opacity: 0, scale: 0 } : {}}
                    animate={animated ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: visibleTags.length * 0.05 + 0.1 }}
                >
                    <TagBadge variant="outline" size={size} animated={false}>
                        +{hiddenCount}
                    </TagBadge>
                </motion.div>
            )}
        </div>
    );
}

/**
 * Интерактивный компонент для добавления тегов
 */
export function TagInput({
    tags = [],
    onAdd,
    onRemove,
    placeholder = "Добавить тег...",
    maxTags = null,
    className = ""
}) {
    const [inputValue, setInputValue] = useState("");
    const [isInputFocused, setIsInputFocused] = useState(false);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (!maxTags || tags.length < maxTags) {
                onAdd?.(inputValue.trim());
                setInputValue("");
            }
        }
    };

    const canAddMore = !maxTags || tags.length < maxTags;

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex flex-wrap gap-2">
                <TagGroup
                    tags={tags}
                    removable={true}
                    onRemove={onRemove}
                    variant="primary"
                    animated={true}
                />
            </div>
            
            {canAddMore && (
                <motion.div
                    className={`
                        flex items-center gap-2 p-3 border-2 border-dashed rounded-xl transition-all duration-200
                        ${isInputFocused 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-300 hover:border-gray-400'
                        }
                    `}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <Hash className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
                    />
                    {maxTags && (
                        <span className="text-xs text-gray-500">
                            {tags.length}/{maxTags}
                        </span>
                    )}
                </motion.div>
            )}
        </div>
    );
}

/**
 * Предустановленные стили тегов для кулинарной тематики
 */
export const CulinaryTagVariants = {
    cuisine: { variant: "gradient", icon: true },
    difficulty: { variant: "primary", icon: false },
    dietary: { variant: "secondary", icon: false },
    course: { variant: "outline", icon: true },
    ingredient: { variant: "default", icon: false }
};
