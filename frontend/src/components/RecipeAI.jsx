"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const COOKING_METHODS = [
  { id: 'pan', label: 'Сковородка' },
  { id: 'oven', label: 'Духовка' },
  { id: 'pot', label: 'Кастрюля' }
];

const COOKING_TIMES = [
  { id: 'quick', label: 'Быстро (до 30 минут)', time: 30 },
  { id: 'medium', label: 'Средне (30-60 минут)', time: 60 },
  { id: 'long', label: 'Долго (более 60 минут)', time: 90 }
];

export default function RecipeAI() {
  const [step, setStep] = useState(0);
  const [cookingMethod, setCookingMethod] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState('');

  const handleGenerateRecipe = () => {
    // Здесь будет логика генерации рецепта
    // Пока что используем заглушку
    setGeneratedRecipe(`Вот что можно приготовить из ваших ингредиентов (${ingredients}) 
    на ${COOKING_METHODS.find(m => m.id === cookingMethod)?.label.toLowerCase()} 
    за ${COOKING_TIMES.find(t => t.id === cookingTime)?.label.toLowerCase()}...`);
    setStep(4);
  };

  const renderStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold text-primary">👨‍🍳 Привет! Я ваш кулинарный помощник Свайп!</h2>
            <p className="text-muted-foreground">
              Я помогу вам создать вкусное блюдо из имеющихся ингредиентов.
              Давайте начнем наше кулинарное приключение!
            </p>
            <Button onClick={() => setStep(1)}>Начать готовить</Button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">На чем будем готовить?</h3>
            <RadioGroup value={cookingMethod} onValueChange={setCookingMethod}>
              {COOKING_METHODS.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id}>{method.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>Назад</Button>
              <Button onClick={() => setStep(2)} disabled={!cookingMethod}>Далее</Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Сколько времени готовы потратить?</h3>
            <RadioGroup value={cookingTime} onValueChange={setCookingTime}>
              {COOKING_TIMES.map((time) => (
                <div key={time.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={time.id} id={time.id} />
                  <Label htmlFor={time.id}>{time.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Назад</Button>
              <Button onClick={() => setStep(3)} disabled={!cookingTime}>Далее</Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Какие ингредиенты у вас есть?</h3>
            <p className="text-sm text-muted-foreground">
              Перечислите через запятую все ингредиенты, которые у вас есть
            </p>
            <Input
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Например: курица, рис, морковь, лук"
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Назад</Button>
              <Button onClick={handleGenerateRecipe} disabled={!ingredients}>
                Сгенерировать рецепт
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Ваш рецепт готов! Пробуйте и вкусно кушайте! 🎉</h3>
            <Card>
              <CardContent className="pt-6">
                <p>{generatedRecipe}</p>
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setStep(0);
                setCookingMethod('');
                setCookingTime('');
                setIngredients('');
                setGeneratedRecipe('');
              }}>Начать заново</Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      {renderStep()}
    </div>
  );
} 