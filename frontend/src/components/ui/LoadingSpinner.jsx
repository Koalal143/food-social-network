"use client"

import { motion } from "framer-motion";
import { ChefHat, Utensils } from "lucide-react";

/**
 * Улучшенный компонент загрузки с брендингом
 * Создает более привлекательный и тематический индикатор загрузки
 */
export default function LoadingSpinner({ 
    size = "md", 
    variant = "default",
    text = "",
    className = "" 
}) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-10 h-10"
    };

    const textSizes = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg"
    };

    if (variant === "chef") {
        return (
            <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
                <motion.div
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 border-t-primary`} />
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <ChefHat className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'} text-primary`} />
                    </motion.div>
                </motion.div>
                {text && (
                    <motion.p 
                        className={`text-gray-600 font-medium ${textSizes[size]}`}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        {text}
                    </motion.p>
                )}
            </div>
        );
    }

    if (variant === "cooking") {
        return (
            <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
                <div className="relative">
                    <motion.div
                        className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360]
                        }}
                        transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Utensils className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'} text-primary`} />
                    </motion.div>
                </div>
                {text && (
                    <motion.p 
                        className={`text-gray-600 font-medium ${textSizes[size]}`}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        {text}
                    </motion.p>
                )}
            </div>
        );
    }

    if (variant === "dots") {
        return (
            <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
                <div className="flex space-x-2">
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'} bg-primary rounded-full`}
                            animate={{
                                y: [0, -10, 0],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: index * 0.2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
                {text && (
                    <p className={`text-gray-600 font-medium ${textSizes[size]}`}>
                        {text}
                    </p>
                )}
            </div>
        );
    }

    // Default spinner
    return (
        <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
            <motion.div
                className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary rounded-full`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            {text && (
                <p className={`text-gray-600 font-medium ${textSizes[size]}`}>
                    {text}
                </p>
            )}
        </div>
    );
}

/**
 * Компонент полноэкранной загрузки
 */
export function FullScreenLoader({ text = "Загрузка...", variant = "chef" }) {
    return (
        <motion.div 
            className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <LoadingSpinner size="xl" variant={variant} text={text} />
        </motion.div>
    );
}

/**
 * Компонент загрузки для карточек
 */
export function CardLoader({ className = "" }) {
    return (
        <div className={`flex items-center justify-center py-8 ${className}`}>
            <LoadingSpinner size="md" variant="dots" />
        </div>
    );
}
