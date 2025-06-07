"use client"

import { Button } from './button';
import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * Универсальный компонент для пустых состояний
 * Улучшает UX когда нет данных для отображения
 * Обновлен с более эмоциональным и профессиональным дизайном
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
    animated = true,
    theme = "default" // новый параметр для тематизации
}) {
    const getThemeClasses = (theme) => {
        const themes = {
            default: "bg-gradient-to-br from-gray-50 to-gray-100/50",
            recipes: "bg-gradient-to-br from-orange-50 to-amber-50/50",
            favorites: "bg-gradient-to-br from-red-50 to-pink-50/50",
            search: "bg-gradient-to-br from-blue-50 to-indigo-50/50",
            error: "bg-gradient-to-br from-red-50 to-orange-50/50"
        };
        return themes[theme] || themes.default;
    };

    const content = (
        <div className={`flex flex-col items-center justify-center py-12 text-center space-y-6 ${className}`}>
            {Icon && (
                <motion.div
                    className={`relative p-6 rounded-2xl shadow-md border border-white/50 ${getThemeClasses(theme)}`}
                    initial={animated ? { scale: 0, rotate: -5 } : {}}
                    animate={animated ? { scale: 1, rotate: 0 } : {}}
                    transition={{
                        duration: 0.4,
                        delay: 0.1,
                        type: "spring",
                        stiffness: 200,
                        damping: 15
                    }}
                    whileHover={{ scale: 1.02, rotate: 1 }}
                >
                    <motion.div
                        animate={animated ? {
                            y: [0, -4, 0],
                        } : {}}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Icon className="w-12 h-12 text-primary drop-shadow-sm" />
                    </motion.div>

                    {/* Декоративные элементы */}
                    <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-primary/20 rounded-full"
                        animate={animated ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : {}}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div
                        className="absolute -bottom-0.5 -left-0.5 w-2 h-2 bg-primary/30 rounded-full"
                        animate={animated ? { scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] } : {}}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                    />
                </motion.div>
            )}

            <motion.div
                className="space-y-3 max-w-md"
                initial={animated ? { opacity: 0, y: 20 } : {}}
                animate={animated ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 }}
            >
                <h3 className="font-semibold text-xl text-gray-900 leading-tight">{title}</h3>
                {description && (
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                )}
            </motion.div>

            {(actionText && (actionHref || actionOnClick)) && (
                <motion.div
                    initial={animated ? { opacity: 0, y: 20 } : {}}
                    animate={animated ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    {actionHref ? (
                        <Button asChild variant={variant} size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                            <Link href={actionHref}>
                                {actionText}
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            onClick={actionOnClick}
                            variant={variant}
                            size="lg"
                            className="shadow-lg hover:shadow-xl transition-shadow"
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
 * Обновлены с более эмоциональными и дружелюбными текстами
 */
export const EmptyStateVariants = {
    noRecipes: {
        title: "Здесь пока пусто",
        description: "Кажется, рецептов по вашим критериям не найдено. Попробуйте расширить поиск или создайте свой первый кулинарный шедевр!",
        theme: "recipes"
    },
    noFavorites: {
        title: "Ваша коллекция ждёт первого рецепта",
        description: "Сохраняйте понравившиеся рецепты, нажимая на ❤️, и создавайте свою персональную кулинарную книгу",
        theme: "favorites"
    },
    noSearchResults: {
        title: "Ничего не найдено",
        description: "Попробуйте другие ключевые слова или проверьте правописание. Возможно, стоит поискать что-то более общее?",
        theme: "search"
    },
    networkError: {
        title: "Что-то пошло не так",
        description: "Проверьте интернет-соединение и попробуйте снова. Мы уже работаем над решением проблемы!",
        theme: "error"
    },
    noRecommendations: {
        title: "Готовим рекомендации для вас",
        description: "Пока мы изучаем ваши предпочтения, попробуйте поискать рецепты самостоятельно или добавьте свой первый рецепт",
        theme: "recipes"
    },
    noUserRecipes: {
        title: "Время создать первый рецепт!",
        description: "Поделитесь своими кулинарными секретами с сообществом. Ваш первый рецепт может стать чьим-то любимым!",
        theme: "recipes"
    }
};
