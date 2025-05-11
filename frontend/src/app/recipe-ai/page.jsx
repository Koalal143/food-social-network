"use client"

import { useState, useEffect } from 'react';
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, ChefHat, Clock, Timer, Calculator, Heart, Share, Printer, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';

const COOKING_METHODS = [
    { id: 'pan', label: 'Сковородка', icon: '🍳' },
    { id: 'oven', label: 'Духовка', icon: '🔥' },
    { id: 'pot', label: 'Кастрюля', icon: '🥘' },
    { id: 'multicooker', label: 'Мультиварка', icon: '⚡' },
];

const COOKING_TIMES = [
    { id: 'quick', label: 'До 30 минут', description: 'Для быстрого перекуса' },
    { id: 'medium', label: '30-60 минут', description: 'Стандартное время приготовления' },
    { id: 'long', label: 'Более 60 минут', description: 'Для особых случаев' },
];

const DIET_PREFERENCES = [
    { id: 'any', label: 'Без ограничений', icon: '🍽️', description: 'Ем всё' },
    { id: 'vegetarian', label: 'Вегетарианец', icon: '🥗', description: 'Без мяса' },
    { id: 'vegan', label: 'Веган', icon: '🌱', description: 'Только растительная пища' },
    { id: 'pescatarian', label: 'Пескетарианец', icon: '🐟', description: 'Рыба и морепродукты' },
];

const HEALTH_GOALS = [
    { id: 'balanced', label: 'Сбалансированное', icon: '⚖️', description: 'Оптимальное соотношение БЖУ' },
    { id: 'protein', label: 'Высокобелковое', icon: '💪', description: 'Для набора мышечной массы' },
    { id: 'lowcarb', label: 'Низкоуглеводное', icon: '🥑', description: 'Для снижения веса' },
    { id: 'keto', label: 'Кето', icon: '🥓', description: 'Минимум углеводов' },
];

const SPICINESS_LEVELS = [
    { id: 'mild', label: 'Мягкое', icon: '🌱', description: 'Без острых специй' },
    { id: 'medium', label: 'Средне', icon: '🌶️', description: 'Немного остроты' },
    { id: 'spicy', label: 'Острое', icon: '🔥', description: 'Люблю поострее' },
    { id: 'very_spicy', label: 'Очень острое', icon: '🔥🔥', description: 'Максимально острое' },
];

const PORTION_SIZES = {
    small: { label: 'Маленькая', multiplier: 0.5 },
    medium: { label: 'Средняя', multiplier: 1 },
    large: { label: 'Большая', multiplier: 1.5 },
    xl: { label: 'Очень большая', multiplier: 2 }
};

const CardHoverEffect = ({ children, selected, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
            borderColor: selected ? 'hsl(var(--primary))' : 'hsl(var(--border))',
            backgroundColor: selected ? 'hsl(var(--primary) / 0.1)' : 'transparent'
        }}
        onClick={onClick}
        className="cursor-pointer transition-colors"
    >
        {children}
    </motion.div>
);

export default function RecipeAIPage() {
    const [step, setStep] = useState(0);
    const [cookingMethod, setCookingMethod] = useState('');
    const [cookingTime, setCookingTime] = useState('');
    const [dietPreference, setDietPreference] = useState('');
    const [healthGoal, setHealthGoal] = useState('');
    const [spicinessLevel, setSpicinessLevel] = useState('');
    const [allergies, setAllergies] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [generatedRecipe, setGeneratedRecipe] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [chefState, setChefState] = useState('idle'); // idle, thinking, cooking
    const [portionSize, setPortionSize] = useState('medium');
    const [isFavorite, setIsFavorite] = useState(false);
    const [timer, setTimer] = useState(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const savedRecipes = localStorage.getItem('favoriteRecipes');
        if (savedRecipes) {
            const recipes = JSON.parse(savedRecipes);
            setIsFavorite(recipes.includes(generatedRecipe));
        }
    }, [generatedRecipe]);

    useEffect(() => {
        let interval;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => {
                    if (time <= 1) {
                        setIsTimerRunning(false);
                        new Audio('/notification.mp3').play().catch(() => {});
                        return 0;
                    }
                    return time - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft]);

    const startTimer = (minutes) => {
        setTimeLeft(minutes * 60);
        setIsTimerRunning(true);
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        const savedRecipes = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
        if (!isFavorite) {
            savedRecipes.push(generatedRecipe);
        } else {
            const index = savedRecipes.indexOf(generatedRecipe);
            if (index > -1) {
                savedRecipes.splice(index, 1);
            }
        }
        localStorage.setItem('favoriteRecipes', JSON.stringify(savedRecipes));
    };

    const shareRecipe = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Рецепт от Свайпа',
                    text: generatedRecipe,
                });
            } catch (error) {
                console.log('Ошибка при попытке поделиться:', error);
            }
        }
    };

    const printRecipe = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Рецепт от Свайпа</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #333; }
                        .recipe { white-space: pre-line; }
                    </style>
                </head>
                <body>
                    <h1>Рецепт от Свайпа</h1>
                    <div class="recipe">${generatedRecipe}</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const triggerConfetti = () => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    };

    const handleGenerateRecipe = () => {
        setIsGenerating(true);
        setChefState('thinking');
        
        setTimeout(() => {
            setChefState('cooking');
            setTimeout(() => {
                setGeneratedRecipe(`
                    🎉 Вот что я предлагаю приготовить из ваших ингредиентов:
                    
                    Название: Паста с овощами
                    
                    Подходит для: ${DIET_PREFERENCES.find(d => d.id === dietPreference)?.label || 'всех'}
                    Уровень остроты: ${SPICINESS_LEVELS.find(s => s.id === spicinessLevel)?.label || 'средний'}
                    Цель питания: ${HEALTH_GOALS.find(h => h.id === healthGoal)?.label || 'сбалансированное'}
                    
                    Ингредиенты:
                    - Паста из цельнозерновой муки
                    - Помидоры черри
                    - Базилик
                    - Чеснок
                    - Оливковое масло
                    
                    Пищевая ценность на 100г:
                    - Белки: 12г
                    - Жиры: 5г
                    - Углеводы: 45г
                    - Калории: 275 ккал
                    
                    Способ приготовления:
                    1. Отварите пасту в подсоленной воде до состояния аль денте
                    2. Обжарьте чеснок на оливковом масле
                    3. Добавьте нарезанные помидоры черри
                    4. Смешайте с пастой
                    5. Украсьте свежим базиликом
                    
                    Приятного аппетита! 🍝
                `);
                setIsGenerating(false);
                setChefState('idle');
                setStep(8);
                triggerConfetti();
            }, 2000);
        }, 2000);
    };

    const renderMethodCard = (method) => (
        <CardHoverEffect selected={cookingMethod === method.id} onClick={() => setCookingMethod(method.id)}>
            <Card>
                <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                    <motion.span 
                        className="text-4xl mb-2"
                        animate={{ rotate: cookingMethod === method.id ? [0, 10, -10, 0] : 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {method.icon}
                    </motion.span>
                    <span className="font-medium">{method.label}</span>
                </CardContent>
            </Card>
        </CardHoverEffect>
    );

    const renderDietCard = (diet) => (
        <CardHoverEffect selected={dietPreference === diet.id} onClick={() => setDietPreference(diet.id)}>
            <Card>
                <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                    <motion.span 
                        className="text-4xl mb-2"
                        animate={{ 
                            scale: dietPreference === diet.id ? [1, 1.2, 1] : 1,
                            rotate: dietPreference === diet.id ? [0, 10, -10, 0] : 0
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        {diet.icon}
                    </motion.span>
                    <span className="font-medium">{diet.label}</span>
                    <span className="text-xs text-muted-foreground">{diet.description}</span>
                </CardContent>
            </Card>
        </CardHoverEffect>
    );

    const renderRecipeActions = () => (
        <div className="flex gap-2 justify-center mt-4">
            <Button
                variant="outline"
                size="icon"
                onClick={toggleFavorite}
                className={isFavorite ? 'text-red-500' : ''}
            >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={shareRecipe}>
                <Share className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={printRecipe}>
                <Printer className="h-4 w-4" />
            </Button>
        </div>
    );

    const renderPortionCalculator = () => (
        <div className="mt-4 space-y-2">
            <h4 className="font-medium">Размер порции:</h4>
            <div className="flex gap-2">
                {Object.entries(PORTION_SIZES).map(([size, { label, multiplier }]) => (
                    <Button
                        key={size}
                        variant={portionSize === size ? 'default' : 'outline'}
                        onClick={() => setPortionSize(size)}
                        className="flex-1"
                    >
                        <Scale className="h-4 w-4 mr-2" />
                        {label}
                    </Button>
                ))}
            </div>
        </div>
    );

    const renderTimer = () => (
        <div className="mt-4 space-y-2">
            <h4 className="font-medium">Таймер приготовления:</h4>
            <div className="flex items-center gap-2">
                <div className="flex-1 text-center text-2xl font-bold">
                    {formatTime(timeLeft)}
                </div>
                {!isTimerRunning ? (
                    <div className="flex gap-2">
                        <Button onClick={() => startTimer(5)} variant="outline">
                            5 мин
                        </Button>
                        <Button onClick={() => startTimer(10)} variant="outline">
                            10 мин
                        </Button>
                        <Button onClick={() => startTimer(15)} variant="outline">
                            15 мин
                        </Button>
                    </div>
                ) : (
                    <Button onClick={() => setIsTimerRunning(false)} variant="destructive">
                        Стоп
                    </Button>
                )}
            </div>
        </div>
    );

    const renderStep = () => {
        switch(step) {
            case 0:
                return (
                    <motion.div 
                        className="space-y-6 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex justify-center flex-col items-center">
                            <ChefHat className="h-24 w-24 text-primary animate-bounce" />
                            <h2 className="text-2xl font-bold text-primary mt-4">Привет! Я ваш личный шеф-повар, Свайп 👨‍🍳</h2>
                        </div>
                        <p className="text-muted-foreground">
                            Я помогу вам создать идеальное блюдо, учитывая все ваши предпочтения и особенности.
                            Давайте начнем наше кулинарное приключение!
                        </p>
                        <Button onClick={() => setStep(1)} className="w-full sm:w-auto">
                            <Bot className="mr-2 h-4 w-4" />
                            Начать готовить
                        </Button>
                    </motion.div>
                );

            case 1:
                return (
                    <motion.div 
                        className="space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="text-xl font-semibold">Какой у вас тип питания?</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {DIET_PREFERENCES.map(renderDietCard)}
                        </div>
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(0)}>Назад</Button>
                            <Button onClick={() => setStep(2)} disabled={!dietPreference}>Далее</Button>
                        </div>
                    </motion.div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Есть ли у вас аллергия?</h3>
                        <div className="space-y-4">
                            <Input
                                value={allergies}
                                onChange={(e) => setAllergies(e.target.value)}
                                placeholder="Например: орехи, молочные продукты, глютен"
                                className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">
                                Укажите через запятую все продукты, на которые у вас аллергия. 
                                Если аллергии нет, оставьте поле пустым.
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(1)}>Назад</Button>
                            <Button onClick={() => setStep(3)}>Далее</Button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Какая у вас цель питания?</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {HEALTH_GOALS.map((goal) => (
                                <Card 
                                    key={goal.id}
                                    className={`cursor-pointer transition-all hover:scale-105 ${
                                        healthGoal === goal.id ? 'border-primary' : ''
                                    }`}
                                    onClick={() => setHealthGoal(goal.id)}
                                >
                                    <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                                        <span className="text-4xl mb-2">{goal.icon}</span>
                                        <span className="font-medium">{goal.label}</span>
                                        <span className="text-xs text-muted-foreground">{goal.description}</span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(2)}>Назад</Button>
                            <Button onClick={() => setStep(4)} disabled={!healthGoal}>Далее</Button>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Насколько острую пищу вы предпочитаете?</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {SPICINESS_LEVELS.map((level) => (
                                <Card 
                                    key={level.id}
                                    className={`cursor-pointer transition-all hover:scale-105 ${
                                        spicinessLevel === level.id ? 'border-primary' : ''
                                    }`}
                                    onClick={() => setSpicinessLevel(level.id)}
                                >
                                    <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                                        <span className="text-4xl mb-2">{level.icon}</span>
                                        <span className="font-medium">{level.label}</span>
                                        <span className="text-xs text-muted-foreground">{level.description}</span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(3)}>Назад</Button>
                            <Button onClick={() => setStep(5)} disabled={!spicinessLevel}>Далее</Button>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <motion.div 
                        className="space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="text-xl font-semibold">На чем будем готовить?</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {COOKING_METHODS.map(renderMethodCard)}
                        </div>
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(4)}>Назад</Button>
                            <Button onClick={() => setStep(6)} disabled={!cookingMethod}>Далее</Button>
                        </div>
                    </motion.div>
                );

            case 6:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Сколько времени готовы потратить?</h3>
                        <div className="space-y-4">
                            {COOKING_TIMES.map((time) => (
                                <Card 
                                    key={time.id}
                                    className={`cursor-pointer transition-all hover:scale-105 ${
                                        cookingTime === time.id ? 'border-primary' : ''
                                    }`}
                                    onClick={() => setCookingTime(time.id)}
                                >
                                    <CardContent className="flex items-center p-4">
                                        <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                                        <div>
                                            <h4 className="font-medium">{time.label}</h4>
                                            <p className="text-sm text-muted-foreground">{time.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(5)}>Назад</Button>
                            <Button onClick={() => setStep(7)} disabled={!cookingTime}>Далее</Button>
                        </div>
                    </div>
                );

            case 7:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Какие ингредиенты у вас есть?</h3>
                        <p className="text-sm text-muted-foreground">
                            Перечислите через запятую все ингредиенты, которые у вас есть в холодильнике
                        </p>
                        <div className="space-y-4">
                            <Textarea
                                value={ingredients}
                                onChange={(e) => setIngredients(e.target.value)}
                                placeholder="Например: курица, рис, морковь, лук"
                                className="min-h-[100px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                Подсказка: чем больше ингредиентов вы укажете, тем точнее будет рецепт
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(6)}>Назад</Button>
                            <Button 
                                onClick={handleGenerateRecipe} 
                                disabled={!ingredients || isGenerating}
                            >
                                {isGenerating ? 'Генерирую рецепт...' : 'Создать рецепт'}
                            </Button>
                        </div>
                    </div>
                );

            case 8:
                return (
                    <motion.div 
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex justify-center mb-6">
                            <ChefHat className="h-24 w-24 text-primary animate-bounce" />
                        </div>
                        <h3 className="text-xl font-semibold text-center">Ваш персональный рецепт готов! 🎉</h3>
                        <Card>
                            <CardContent className="p-6">
                                <div className="whitespace-pre-line">
                                    {generatedRecipe}
                                </div>
                                {renderRecipeActions()}
                                {renderPortionCalculator()}
                                {renderTimer()}
                            </CardContent>
                        </Card>
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => {
                                setStep(0);
                                setCookingMethod('');
                                setCookingTime('');
                                setDietPreference('');
                                setHealthGoal('');
                                setSpicinessLevel('');
                                setAllergies('');
                                setIngredients('');
                                setGeneratedRecipe('');
                                setChefState('idle');
                                setTimeLeft(0);
                                setIsTimerRunning(false);
                            }}>Начать заново</Button>
                            <Button onClick={() => setStep(7)}>Изменить ингредиенты</Button>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <Container>
            <div className="max-w-2xl mx-auto py-8">
                {isGenerating && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="text-center">
                            <ChefHat className="h-24 w-24 text-primary animate-bounce" />
                            <p className="mt-4 text-lg font-medium">
                                {chefState === 'thinking' ? 'Думаю над рецептом...' : 'Готовлю рецепт...'}
                            </p>
                        </div>
                    </div>
                )}
                {renderStep()}
            </div>
        </Container>
    );
} 