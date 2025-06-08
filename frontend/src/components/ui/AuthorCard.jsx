"use client"

import { motion } from "framer-motion";
import { User, MapPin, Calendar, ChefHat, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./button";

/**
 * Улучшенный компонент карточки автора
 * Более привлекательный дизайн с анимациями и статистикой
 */
export default function AuthorCard({
    author,
    variant = "default", // "default", "compact", "detailed", "minimal"
    showStats = true,
    showFollowButton = true,
    className = "",
    animated = true
}) {
    if (!author) return null;

    const cardVariants = {
        default: "p-6",
        compact: "p-4",
        detailed: "p-8",
        minimal: "p-3"
    };

    const avatarSizes = {
        default: "w-12 h-12",
        compact: "w-10 h-10",
        detailed: "w-14 h-14",
        minimal: "w-8 h-8"
    };

    const content = (
        <div className={`
            bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md 
            transition-all duration-300 ${cardVariants[variant]} ${className}
        `}>
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <motion.div
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className={`${avatarSizes[variant]} rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-white shadow-lg`}>
                        {author.avatar ? (
                            <Image
                                src={author.avatar}
                                alt={author.name || author.username}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className={`${variant === 'minimal' ? 'w-5 h-5' : variant === 'compact' ? 'w-6 h-6' : 'w-8 h-8'} text-gray-400`} />
                            </div>
                        )}
                    </div>
                    
                    {/* Online indicator */}
                    {author.isOnline && (
                        <motion.div
                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                        />
                    )}
                </motion.div>

                {/* Author Info */}
                <div className="flex-1 min-w-0">
                    <motion.div
                        initial={animated ? { opacity: 0, y: 10 } : {}}
                        animate={animated ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className={`font-semibold text-gray-900 truncate ${
                            variant === 'minimal' ? 'text-sm' : 
                            variant === 'compact' ? 'text-base' : 'text-lg'
                        }`}>
                            {author.name || author.username}
                        </h3>
                        
                        {author.username && author.name && (
                            <p className="text-sm text-gray-500 truncate">@{author.username}</p>
                        )}
                        
                        {variant !== 'minimal' && author.bio && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{author.bio}</p>
                        )}
                    </motion.div>

                    {/* Author Meta */}
                    {variant !== 'minimal' && (
                        <motion.div
                            className="flex items-center gap-3 mt-2 text-xs text-gray-500"
                            initial={animated ? { opacity: 0 } : {}}
                            animate={animated ? { opacity: 1 } : {}}
                            transition={{ delay: 0.2 }}
                        >
                            {author.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{author.location}</span>
                                </div>
                            )}
                            
                            {author.joinedDate && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>С {new Date(author.joinedDate).getFullYear()}</span>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Stats */}
                    {showStats && variant !== 'minimal' && (
                        <motion.div
                            className="flex items-center gap-4 mt-3"
                            initial={animated ? { opacity: 0, y: 10 } : {}}
                            animate={animated ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.3 }}
                        >
                            {author.recipesCount !== undefined && (
                                <div className="flex items-center gap-1 text-sm">
                                    <ChefHat className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-gray-900">{author.recipesCount}</span>
                                    <span className="text-gray-500">рецептов</span>
                                </div>
                            )}
                            
                            {author.rating !== undefined && (
                                <div className="flex items-center gap-1 text-sm">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="font-medium text-gray-900">{author.rating}</span>
                                </div>
                            )}
                            
                            {author.followersCount !== undefined && (
                                <div className="flex items-center gap-1 text-sm">
                                    <Users className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium text-gray-900">{author.followersCount}</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Follow Button */}
                {showFollowButton && variant !== 'minimal' && (
                    <motion.div
                        initial={animated ? { opacity: 0, scale: 0.8 } : {}}
                        animate={animated ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.4 }}
                    >
                        <Button
                            variant={author.isFollowing ? "outline" : "default"}
                            size={variant === 'compact' ? "sm" : "default"}
                            className="whitespace-nowrap"
                        >
                            {author.isFollowing ? "Отписаться" : "Подписаться"}
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );

    if (animated) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.3 }}
            >
                {author.profileUrl ? (
                    <Link href={author.profileUrl}>
                        {content}
                    </Link>
                ) : (
                    content
                )}
            </motion.div>
        );
    }

    return author.profileUrl ? (
        <Link href={author.profileUrl}>
            {content}
        </Link>
    ) : (
        content
    );
}

/**
 * Компонент списка авторов
 */
export function AuthorList({ 
    authors, 
    variant = "default",
    showStats = true,
    className = "",
    animated = true 
}) {
    return (
        <div className={`space-y-4 ${className}`}>
            {authors.map((author, index) => (
                <motion.div
                    key={author.id || author.username}
                    initial={animated ? { opacity: 0, x: -20 } : {}}
                    animate={animated ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                    <AuthorCard
                        author={author}
                        variant={variant}
                        showStats={showStats}
                        animated={false}
                    />
                </motion.div>
            ))}
        </div>
    );
}

/**
 * Компонент мини-карточки автора для встраивания
 */
export function MiniAuthorCard({ author, className = "" }) {
    return (
        <AuthorCard
            author={author}
            variant="minimal"
            showStats={false}
            showFollowButton={false}
            className={className}
            animated={false}
        />
    );
}
