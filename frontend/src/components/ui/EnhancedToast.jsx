"use client"

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, ChefHat } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Улучшенный компонент уведомлений с анимациями и кулинарной тематикой
 * Дополняет стандартный Toast более привлекательным дизайном
 */
export default function EnhancedToast({
    type = "info", // "success", "error", "warning", "info", "recipe"
    title,
    message,
    duration = 5000,
    onClose,
    position = "top-right",
    showProgress = true,
    className = ""
}) {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (duration > 0) {
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev - (100 / (duration / 100));
                    if (newProgress <= 0) {
                        clearInterval(progressInterval);
                        handleClose();
                        return 0;
                    }
                    return newProgress;
                });
            }, 100);

            return () => clearInterval(progressInterval);
        }
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
    };

    const getTypeConfig = () => {
        const configs = {
            success: {
                icon: CheckCircle,
                bgGradient: "from-green-50 to-emerald-50",
                borderColor: "border-green-200",
                iconColor: "text-green-600",
                titleColor: "text-green-900",
                messageColor: "text-green-700",
                progressColor: "bg-gradient-to-r from-green-500 to-emerald-500"
            },
            error: {
                icon: AlertCircle,
                bgGradient: "from-red-50 to-rose-50",
                borderColor: "border-red-200",
                iconColor: "text-red-600",
                titleColor: "text-red-900",
                messageColor: "text-red-700",
                progressColor: "bg-gradient-to-r from-red-500 to-rose-500"
            },
            warning: {
                icon: AlertTriangle,
                bgGradient: "from-yellow-50 to-amber-50",
                borderColor: "border-yellow-200",
                iconColor: "text-yellow-600",
                titleColor: "text-yellow-900",
                messageColor: "text-yellow-700",
                progressColor: "bg-gradient-to-r from-yellow-500 to-amber-500"
            },
            info: {
                icon: Info,
                bgGradient: "from-blue-50 to-sky-50",
                borderColor: "border-blue-200",
                iconColor: "text-blue-600",
                titleColor: "text-blue-900",
                messageColor: "text-blue-700",
                progressColor: "bg-gradient-to-r from-blue-500 to-sky-500"
            },
            recipe: {
                icon: ChefHat,
                bgGradient: "from-orange-50 to-amber-50",
                borderColor: "border-orange-200",
                iconColor: "text-orange-600",
                titleColor: "text-orange-900",
                messageColor: "text-orange-700",
                progressColor: "bg-gradient-to-r from-orange-500 to-amber-500"
            }
        };
        return configs[type] || configs.info;
    };

    const config = getTypeConfig();
    const Icon = config.icon;

    const positionClasses = {
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "top-center": "top-4 left-1/2 transform -translate-x-1/2",
        "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2"
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`fixed z-50 ${positionClasses[position]} ${className}`}
                    initial={{ 
                        opacity: 0, 
                        scale: 0.8,
                        x: position.includes('right') ? 100 : position.includes('left') ? -100 : 0,
                        y: position.includes('top') ? -50 : position.includes('bottom') ? 50 : 0
                    }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1,
                        x: 0,
                        y: 0
                    }}
                    exit={{ 
                        opacity: 0, 
                        scale: 0.8,
                        x: position.includes('right') ? 100 : position.includes('left') ? -100 : 0
                    }}
                    transition={{ 
                        duration: 0.3,
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                    }}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className={`
                        bg-gradient-to-br ${config.bgGradient}
                        ${config.borderColor} border-2 rounded-2xl shadow-xl backdrop-blur-sm 
                        p-5 max-w-sm w-full relative overflow-hidden
                    `}>
                        {/* Декоративные элементы */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
                        
                        <div className="flex items-start gap-4 relative z-10">
                            <motion.div
                                className={`p-2 rounded-xl bg-white/50 ${config.iconColor}`}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
                                whileHover={{ rotate: 10, scale: 1.1 }}
                            >
                                <Icon className="w-6 h-6" />
                            </motion.div>
                            
                            <div className="flex-1 min-w-0">
                                {title && (
                                    <motion.h4 
                                        className={`font-bold text-lg ${config.titleColor} mb-1`}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.3 }}
                                    >
                                        {title}
                                    </motion.h4>
                                )}
                                <motion.p 
                                    className={`text-sm ${config.messageColor} leading-relaxed`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.3 }}
                                >
                                    {message}
                                </motion.p>
                            </div>
                            
                            <motion.button
                                onClick={handleClose}
                                className={`${config.iconColor} hover:opacity-70 transition-opacity p-2 rounded-lg bg-white/30 hover:bg-white/50`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <X className="w-4 h-4" />
                            </motion.button>
                        </div>
                        
                        {showProgress && duration > 0 && (
                            <motion.div 
                                className="absolute bottom-0 left-0 h-2 bg-white/20 w-full rounded-b-2xl overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <motion.div 
                                    className={`h-full ${config.progressColor} rounded-br-2xl`}
                                    style={{ width: `${progress}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Компонент контейнера для уведомлений
 */
export function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {toasts.map((toast, index) => (
                <EnhancedToast
                    key={toast.id}
                    {...toast}
                    onClose={() => removeToast(toast.id)}
                    className="pointer-events-auto"
                    style={{ 
                        top: `${4 + index * 80}px` // Стекинг уведомлений
                    }}
                />
            ))}
        </div>
    );
}

/**
 * Предустановленные уведомления для кулинарной тематики
 */
export const RecipeToasts = {
    recipeAdded: {
        type: "recipe",
        title: "Рецепт добавлен!",
        message: "Ваш кулинарный шедевр теперь доступен всем пользователям"
    },
    recipeSaved: {
        type: "success", 
        title: "Сохранено в избранное",
        message: "Рецепт добавлен в вашу личную коллекцию"
    },
    recipeRemoved: {
        type: "info",
        title: "Удалено из избранного",
        message: "Рецепт больше не в вашей коллекции"
    },
    cookingStarted: {
        type: "recipe",
        title: "Приятного аппетита!",
        message: "Удачи в приготовлении этого блюда"
    }
};
