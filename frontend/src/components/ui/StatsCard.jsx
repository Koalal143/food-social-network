"use client"

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Компонент для отображения статистики с анимациями
 * Подходит для дашбордов и аналитики
 */
export default function StatsCard({
    title,
    value,
    change,
    changeType = "neutral", // "positive", "negative", "neutral"
    icon: Icon,
    description,
    className = "",
    animated = true,
    gradient = false
}) {
    const getTrendIcon = () => {
        switch (changeType) {
            case "positive":
                return <TrendingUp className="w-4 h-4" />;
            case "negative":
                return <TrendingDown className="w-4 h-4" />;
            default:
                return <Minus className="w-4 h-4" />;
        }
    };

    const getTrendColor = () => {
        switch (changeType) {
            case "positive":
                return "text-green-600 bg-green-50";
            case "negative":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    const cardContent = (
        <div className={`
            ${gradient 
                ? "bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50" 
                : "bg-white border-gray-200"
            } 
            border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 
            ${className}
        `}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <motion.p 
                        className="text-3xl font-bold text-gray-900 mb-2"
                        initial={animated ? { scale: 0.8, opacity: 0 } : {}}
                        animate={animated ? { scale: 1, opacity: 1 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {value}
                    </motion.p>
                    
                    {change && (
                        <motion.div 
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()}`}
                            initial={animated ? { x: -10, opacity: 0 } : {}}
                            animate={animated ? { x: 0, opacity: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            {getTrendIcon()}
                            {change}
                        </motion.div>
                    )}
                    
                    {description && (
                        <p className="text-sm text-gray-500 mt-2">{description}</p>
                    )}
                </div>
                
                {Icon && (
                    <motion.div 
                        className="p-3 bg-primary/10 rounded-xl"
                        initial={animated ? { scale: 0, rotate: -45 } : {}}
                        animate={animated ? { scale: 1, rotate: 0 } : {}}
                        transition={{ 
                            duration: 0.5, 
                            delay: 0.1,
                            type: "spring",
                            stiffness: 200 
                        }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                        <Icon className="w-6 h-6 text-primary" />
                    </motion.div>
                )}
            </div>
        </div>
    );

    if (animated) {
        return (
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -2 }}
            >
                {cardContent}
            </motion.div>
        );
    }

    return cardContent;
}

/**
 * Компонент сетки статистики
 */
export function StatsGrid({ stats, className = "", animated = true }) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={animated ? { y: 20, opacity: 0 } : {}}
                    animate={animated ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <StatsCard {...stat} animated={animated} />
                </motion.div>
            ))}
        </div>
    );
}

/**
 * Компонент мини-статистики для встраивания
 */
export function MiniStatsCard({ 
    label, 
    value, 
    icon: Icon, 
    color = "primary",
    className = "" 
}) {
    const colorClasses = {
        primary: "bg-primary/10 text-primary",
        green: "bg-green-100 text-green-700",
        blue: "bg-blue-100 text-blue-700",
        orange: "bg-orange-100 text-orange-700",
        purple: "bg-purple-100 text-purple-700"
    };

    return (
        <motion.div 
            className={`flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 ${className}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            {Icon && (
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-4 h-4" />
                </div>
            )}
            <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-lg font-semibold text-gray-900">{value}</p>
            </div>
        </motion.div>
    );
}
