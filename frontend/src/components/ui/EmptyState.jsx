"use client"

import { Button } from './button';
import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * Универсальный компонент для пустых состояний
 * Улучшает UX когда нет данных для отображения
 */
export default function EmptyState({ 
    icon: Icon, 
    title, 
    description, 
    actionText,
    actionHref,
    actionOnClick,
    variant = "default",
    className = "",
    animated = true
}) {
    const content = (
        <div className={`flex flex-col items-center justify-center py-12 text-center space-y-6 ${className}`}>
            {Icon && (
                <motion.div 
                    className="bg-secondary/60 p-6 rounded-full"
                    initial={animated ? { scale: 0 } : {}}
                    animate={animated ? { scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Icon className="w-12 h-12 text-primary" />
                </motion.div>
            )}
            
            <motion.div 
                className="space-y-3 max-w-md"
                initial={animated ? { opacity: 0, y: 20 } : {}}
                animate={animated ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <h3 className="font-semibold text-xl text-gray-900">{title}</h3>
                {description && (
                    <p className="text-muted-foreground leading-relaxed">{description}</p>
                )}
            </motion.div>

            {(actionText && (actionHref || actionOnClick)) && (
                <motion.div
                    initial={animated ? { opacity: 0, y: 20 } : {}}
                    animate={animated ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    {actionHref ? (
                        <Button asChild variant={variant} size="lg">
                            <Link href={actionHref}>
                                {actionText}
                            </Link>
                        </Button>
                    ) : (
                        <Button 
                            onClick={actionOnClick} 
                            variant={variant} 
                            size="lg"
                        >
                            {actionText}
                        </Button>
                    )}
                </motion.div>
            )}
        </div>
    );

    if (animated) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {content}
            </motion.div>
        );
    }

    return content;
}

/**
 * Предустановленные варианты пустых состояний
 */
export const EmptyStateVariants = {
    noRecipes: {
        title: "Рецепты не найдены",
        description: "Попробуйте изменить параметры поиска или добавить новый рецепт"
    },
    noFavorites: {
        title: "У вас пока нет избранных рецептов",
        description: "Сохраняйте понравившиеся рецепты, нажимая на сердечко"
    },
    noSearchResults: {
        title: "По вашему запросу ничего не найдено",
        description: "Попробуйте использовать другие ключевые слова или проверьте правописание"
    },
    networkError: {
        title: "Проблемы с подключением",
        description: "Проверьте интернет-соединение и попробуйте снова"
    }
};
