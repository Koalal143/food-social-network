"use client"

import { useState, useRef } from 'react'
import Container from '@/components/layout/Container'
import RecipeSwipeCard from '@/components/shared/RecipeSwipeCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
    TestTube, 
    RefreshCw, 
    Trash2, 
    Activity,
    ThumbsDown,
    Bookmark,
    FastForward,
    Eye,
    Smartphone,
    Monitor
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SwipeTestPage() {
    const { toast } = useToast()
    const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0)
    const [direction, setDirection] = useState(null)
    const [swipeLog, setSwipeLog] = useState([])
    const [isMonitoring, setIsMonitoring] = useState(false)
    const [stats, setStats] = useState({
        totalSwipes: 0,
        likes: 0,
        dislikes: 0,
        skips: 0,
        views: 0
    })

    // Тестовые рецепты
    const testRecipes = [
        {
            id: 1,
            title: "Паста Карбонара",
            short_description: "Классическая итальянская паста с беконом, яйцами и сыром пармезан",
            image_url: "/images/image-dummy.svg",
            cook_time_minutes: 30,
            difficulty: "medium",
            slug: "pasta-carbonara"
        },
        {
            id: 2,
            title: "Борщ украинский",
            short_description: "Традиционный украинский борщ с говядиной и свежей капустой",
            image_url: "/images/image-dummy.svg",
            cook_time_minutes: 120,
            difficulty: "hard",
            slug: "ukrainian-borscht"
        },
        {
            id: 3,
            title: "Салат Цезарь",
            short_description: "Свежий салат с курицей, сухариками и соусом цезарь",
            image_url: "/images/image-dummy.svg",
            cook_time_minutes: 15,
            difficulty: "easy",
            slug: "caesar-salad"
        },
        {
            id: 4,
            title: "Тирамису",
            short_description: "Нежный итальянский десерт с маскарпоне и кофе",
            image_url: "/images/image-dummy.svg",
            cook_time_minutes: 240,
            difficulty: "medium",
            slug: "tiramisu"
        },
        {
            id: 5,
            title: "Суши роллы",
            short_description: "Домашние суши роллы с лососем и авокадо",
            image_url: "/images/image-dummy.svg",
            cook_time_minutes: 45,
            difficulty: "hard",
            slug: "sushi-rolls"
        }
    ]

    const currentRecipe = testRecipes[currentRecipeIndex]

    const logSwipe = (action, recipe) => {
        const logEntry = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            action,
            recipe: recipe.title,
            recipeId: recipe.id
        }
        
        setSwipeLog(prev => [logEntry, ...prev.slice(0, 19)]) // Ограничиваем до 20 записей
        
        setStats(prev => ({
            ...prev,
            totalSwipes: prev.totalSwipes + 1,
            [action]: prev[action] + 1
        }))

        if (isMonitoring) {
            toast({
                variant: "default",
                title: `${action.toUpperCase()}: ${recipe.title}`,
                description: `Время: ${logEntry.timestamp}`,
                duration: 2000,
            })
        }
    }

    const handleDislike = (recipe) => {
        logSwipe('dislikes', recipe)
        setDirection('left')
        moveToNextRecipe()
    }

    const handleLike = (recipe) => {
        logSwipe('likes', recipe)
        setDirection('right')
        moveToNextRecipe()
    }

    const handleSkip = (recipe) => {
        logSwipe('skips', recipe)
        setDirection('up')
        moveToNextRecipe()
    }

    const handleView = (recipe) => {
        logSwipe('views', recipe)
        
        toast({
            variant: "default",
            title: "Просмотр рецепта",
            description: `Открыт рецепт: ${recipe.title}`,
        })
    }

    const moveToNextRecipe = () => {
        setTimeout(() => {
            setCurrentRecipeIndex(prev => (prev + 1) % testRecipes.length)
            setDirection(null)
        }, 500)
    }

    const resetTest = () => {
        setCurrentRecipeIndex(0)
        setDirection(null)
        setSwipeLog([])
        setStats({
            totalSwipes: 0,
            likes: 0,
            dislikes: 0,
            skips: 0,
            views: 0
        })
        
        toast({
            variant: "default",
            title: "Тест сброшен",
            description: "Все данные очищены",
        })
    }

    const toggleMonitoring = () => {
        setIsMonitoring(!isMonitoring)
        
        toast({
            variant: "default",
            title: isMonitoring ? "Мониторинг остановлен" : "Мониторинг запущен",
            description: isMonitoring ? "Уведомления отключены" : "Уведомления включены",
        })
    }

    const getActionIcon = (action) => {
        switch (action) {
            case 'likes':
                return <Bookmark className="w-4 h-4 text-pink-500" />
            case 'dislikes':
                return <ThumbsDown className="w-4 h-4 text-red-500" />
            case 'skips':
                return <FastForward className="w-4 h-4 text-blue-500" />
            case 'views':
                return <Eye className="w-4 h-4 text-gray-500" />
            default:
                return <Activity className="w-4 h-4" />
        }
    }

    const getActionColor = (action) => {
        switch (action) {
            case 'likes':
                return 'bg-pink-100 text-pink-800'
            case 'dislikes':
                return 'bg-red-100 text-red-800'
            case 'skips':
                return 'bg-blue-100 text-blue-800'
            case 'views':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <Container>
            <div className="py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <TestTube className="w-8 h-8" />
                            Тест свайпов
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Тестирование функциональности свайпов в карточках рецептов
                        </p>
                    </div>
                </div>

                {/* Панель управления */}
                <Card>
                    <CardHeader>
                        <CardTitle>Панель управления</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={toggleMonitoring}
                                variant={isMonitoring ? "destructive" : "default"}
                                className="flex items-center gap-2"
                            >
                                <Activity className="w-4 h-4" />
                                {isMonitoring ? 'Остановить мониторинг' : 'Начать мониторинг'}
                            </Button>
                            
                            <Button
                                onClick={resetTest}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Сбросить тест
                            </Button>
                            
                            <Button
                                onClick={() => moveToNextRecipe()}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <FastForward className="w-4 h-4" />
                                Следующий рецепт
                            </Button>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4" />
                                <span>Десктоп: Drag & Drop</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4" />
                                <span>Мобильный: Touch свайпы</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Статистика */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Всего</p>
                                    <p className="text-2xl font-bold">{stats.totalSwipes}</p>
                                </div>
                                <Activity className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Лайки</p>
                                    <p className="text-2xl font-bold text-pink-600">{stats.likes}</p>
                                </div>
                                <Bookmark className="w-8 h-8 text-pink-500" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Дизлайки</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.dislikes}</p>
                                </div>
                                <ThumbsDown className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Скипы</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.skips}</p>
                                </div>
                                <FastForward className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Просмотры</p>
                                    <p className="text-2xl font-bold text-gray-600">{stats.views}</p>
                                </div>
                                <Eye className="w-8 h-8 text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Карточка для тестирования */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Тестовая карточка</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Рецепт {currentRecipeIndex + 1} из {testRecipes.length}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[600px] flex items-center justify-center">
                                <AnimatePresence mode="wait" onExitComplete={() => setDirection(null)}>
                                    {currentRecipe && (
                                        <RecipeSwipeCard
                                            key={`test-recipe-${currentRecipe.id}`}
                                            recipe={currentRecipe}
                                            direction={direction}
                                            onSkip={handleSkip}
                                            onDislike={handleDislike}
                                            onLike={handleLike}
                                            onViewRecipe={handleView}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Лог действий */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Лог действий</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {swipeLog.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    Выполните свайп для начала логирования
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {swipeLog.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="flex items-center gap-3 p-3 border rounded-lg"
                                        >
                                            {getActionIcon(entry.action)}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getActionColor(entry.action)}>
                                                        {entry.action.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-medium truncate">
                                                    {entry.recipe}
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {entry.timestamp}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Инструкции */}
                <Card>
                    <CardHeader>
                        <CardTitle>Инструкции по тестированию</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <ThumbsDown className="w-5 h-5 text-red-500" />
                                    <span className="font-medium">Дизлайк</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Свайп влево или drag влево
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Bookmark className="w-5 h-5 text-pink-500" />
                                    <span className="font-medium">Лайк</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Свайп вправо или drag вправо
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FastForward className="w-5 h-5 text-blue-500" />
                                    <span className="font-medium">Скип</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Свайп вверх или drag вверх
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Container>
    )
}
