"use client";

import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRecipes } from '@/context/RecipeContext';

const AddRecipeForm = () => {
  const { addRecipe } = useRecipes()

  const { control, handleSubmit, register, setValue } = useForm({
    defaultValues: {
      ingredients: [{ name: '', quantity: '' }],
      instructions: [{ step_number: 1, description: '', photo: null }],
      difficulty: '',
      tag: ''
    },
  });
  
  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control,
    name: 'instructions',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      instructionFields.forEach((_, index) => {
        setValue(`instructions.${index}.step_number`, index + 1, {
          shouldDirty: true,
          shouldValidate: true,
        });
      });
    }, 0);
  
    return () => clearTimeout(timer);
  }, [instructionFields, setValue]);
  
  const handleAddInstruction = () => {
    if (instructionFields.length < 25) {
      const nextStepNumber = instructionFields.length + 1;
      appendInstruction({ step_number: nextStepNumber, description: '', photo: null });
    }
  };
  
  const { toast } = useToast();

  const onSubmit = (data) => {
    addRecipe(data)
    toast({
      title: "Рецепт успешно добавлен",
      description: "Ваш рецепт был сохранен.",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Название рецепта</Label>
            <Input
              {...register('title', { required: 'Название обязательно' })}
              type="text"
              placeholder="Введите название рецепта"
            />
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              {...register('short_description', { required: 'Описание обязательно' })}
              rows={3}
              placeholder="Краткое описание рецепта"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Время приготовления (в минутах)</Label>
              <Input
                {...register('cook_time_minutes', { required: 'Время обязательно' })}
                type="number"
                placeholder="Например: 60"
              />
            </div>

            {/* Порции */}
            {/* <div className="space-y-2">
              <Label>Количество порций</Label>
              <Input
                {...register('servings', { required: 'Количество порций обязательно' })}
                type="number"
                min="1"
                placeholder="2"
              />
            </div> */}

            {/* ТЭГИ */}
            {/* <div className="space-y-2">
              <Label>Тэг</Label>
              <Controller
                name="tag"
                control={control}
                rules={{ required: 'Сложность обязательна' }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите сложность" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Завтрак">Завтрак</SelectItem>
                      <SelectItem value="Обед">Обед</SelectItem>
                      <SelectItem value="Ужин">Ужин</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div> */}

            <div className="space-y-2">
              <Label>Сложность</Label>
              <Controller
                name="difficulty"
                control={control}
                rules={{ required: 'Сложность обязательна' }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите сложность" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Легко</SelectItem>
                      <SelectItem value="MEDIUM">Средне</SelectItem>
                      <SelectItem value="HARD">Сложно</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Фото блюда</Label>
            <Input
              {...register('main_photo', { required: 'Фото обязательно' })}
              type="file"
              accept="image/*"
              placeholder="Загрузите фото блюда"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Ингредиенты
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (ingredientFields.length < 50) {
                  appendIngredient({ name: '', quantity: '' });
                }
              }}
              disabled={ingredientFields.length >= 50}
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить ингредиент
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ingredientFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                {...register(`ingredients.${index}.name`, { required: 'Название обязательно' })}
                type="text"
                placeholder="Название (например, Мука)"
              />
              <Input
                {...register(`ingredients.${index}.quantity`, { required: 'Количество обязательно' })}
                type="text"
                placeholder="Количество (например, 200 г)"
              />
              {ingredientFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIngredient(index)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Инструкция приготовления
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddInstruction}
              disabled={instructionFields.length >= 25}
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить шаг
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {instructionFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium mt-2">
                {index + 1}
              </div>
              <div className="flex-1 space-y-2">
                <Textarea
                  {...register(`instructions.${index}.description`, { required: 'Текст шага обязателен' })}
                  placeholder={`Шаг ${field.step_number}`}
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <Controller
                    name={`instructions.${index}.photo`}
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              field.onChange(file); // Обновляем значение в форме
                            }
                          }}
                          className="w-full"
                          placeholder="Загрузите фото для шага"
                        />
                      </div>
                    )}
                  />
                    {field.photo && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setValue(`instructions.${index}.photo`, null);
                        }}
                        className="text-destructive hover:text-destructive/80"
                      >
                        Удалить фото
                      </Button>
                    )}
                </div>
              </div>
              {instructionFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInstruction(index)}
                  className="text-destructive hover:text-destructive/80 mt-2"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg">
        Опубликовать рецепт
      </Button>
    </form>
  );
};

export default AddRecipeForm;
