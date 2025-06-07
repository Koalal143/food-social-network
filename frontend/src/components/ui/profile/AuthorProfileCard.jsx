import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChefHat, User } from "lucide-react"

export default function AuthorProfileCard({ user, totalRecipes, username }) {
    if (!user) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusBadge = () => {
        if (user.is_active) {
            return (
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                    Активен
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></div>
                Неактивен
            </Badge>
        );
    };

    return (
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-0">
                {/* Фоновый градиент */}
                <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"></div>
                
                {/* Основной контент */}
                <div className="px-6 pb-6 -mt-12 relative">
                    <div className="flex flex-col md:flex-row md:items-end gap-6">
                        {/* Аватар */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-1">
                                <div className="w-full h-full rounded-full overflow-hidden bg-card shadow-lg">
                                    <Image
                                        src={user.profile?.avatar_url || '/images/user-dummy.svg'}
                                        alt={user.username}
                                        width={88}
                                        height={88}
                                        priority
                                        unoptimized={true}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Информация о пользователе */}
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl font-bold tracking-tight">{user.username}</h1>
                                    {getStatusBadge()}
                                </div>
                                
                                <div className="max-w-2xl">
                                    {user.profile?.about && (
                                        <p className="text-muted-foreground leading-relaxed line-clamp-3">
                                            {user.profile.about}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Статистика */}
                            <div className="flex flex-wrap gap-6 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <ChefHat className="w-4 h-4" />
                                    <span className="font-medium text-foreground">{totalRecipes}</span>
                                    <span>
                                        {totalRecipes === 1 ? 'рецепт' : 
                                         totalRecipes >= 2 && totalRecipes <= 4 ? 'рецепта' : 'рецептов'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>С нами с {formatDate(user.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
