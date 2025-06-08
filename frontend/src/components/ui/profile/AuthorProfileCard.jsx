import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Calendar, ChefHat, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export default function AuthorProfileCard({ user, totalRecipes }) {
    if (!user) return null;

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };



    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Аватар */}
                    <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                            <Image
                                src={user.profile?.avatar_url || '/images/user-dummy.svg'}
                                alt={user.username}
                                width={80}
                                height={80}
                                priority
                                unoptimized={true}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Информация о пользователе */}
                    <div className="flex-1 space-y-4">
                        <div className="space-y-3">
                            <h1 className="text-2xl font-bold tracking-tight">{user.username}</h1>

                            {/* Описание */}
                            <div className="max-w-3xl">
                                {user.profile?.about ? (
                                    <div className="space-y-3">
                                        <div
                                            className={`text-foreground/80 leading-relaxed text-base transition-all duration-200 ${
                                                isDescriptionExpanded ? '' : 'line-clamp-3'
                                            }`}
                                            style={{
                                                lineHeight: '1.6'
                                            }}
                                        >
                                            {/* Разбиваем текст на абзацы для лучшей читаемости */}
                                            {user.profile.about.split('\n').map((paragraph, index) => (
                                                paragraph.trim() && (
                                                    <p key={index} className={index > 0 ? 'mt-3' : ''}>
                                                        {paragraph.trim()}
                                                    </p>
                                                )
                                            ))}
                                        </div>

                                        {user.profile.about.length > 150 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                className="h-auto p-0 text-primary hover:text-primary/80 font-medium"
                                            >
                                                {isDescriptionExpanded ? (
                                                    <>
                                                        <ChevronUp className="w-4 h-4 mr-1" />
                                                        Свернуть
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="w-4 h-4 mr-1" />
                                                        Показать полностью
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic text-base">
                                        Пользователь пока не добавил описание
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Статистика */}
                        <div className="flex flex-wrap gap-8 text-sm pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2.5 text-muted-foreground">
                                <div className="bg-primary/10 p-1.5 rounded-lg">
                                    <ChefHat className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-foreground text-base">{totalRecipes}</span>
                                    <span className="text-base">
                                        {totalRecipes === 1 ? 'рецепт' :
                                         totalRecipes >= 2 && totalRecipes <= 4 ? 'рецепта' : 'рецептов'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 text-muted-foreground">
                                <div className="bg-primary/10 p-1.5 rounded-lg">
                                    <Calendar className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-base">С нами с {formatDate(user.created_at)}</span>
                            </div>
                    </div>
                </div>
            </div>
            </CardContent>
        </Card>
    );
}
