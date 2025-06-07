"use client";

import { useEffect, useState } from 'react';
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
import { Plus, Trash, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRecipes } from '@/context/RecipeContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from 'next/navigation';

// Импорты для новой валидации
import {
    getRecipeValidationRules,
    validateIngredients,
    validateInstructions,
    RECIPE_VALIDATION_CONSTANTS,
} from '@/lib/validation/recipe.validation';
import { useRecipeTags } from '@/hooks/useRecipeTags';
import RecipeTagsInput from './RecipeTagsInput';
import { handleApiError } from '@/utils/errorHandler';

const AddRecipeForm = () => {
    const { addRecipe } = useRecipes();
    const router = useRouter();
    const { toast } = useToast();

    // Хук для управления тегами
    const {
        tags,
        tagInput,
        tagError,
        addTag,
        removeTag,
        setTagInput,
        handleTagInputKeyPress,
        validateAllTags,
        canAddMoreTags,
        maxTagsCount,
    } = useRecipeTags();

    // Состояния для превью фотографий
    const [mainPhotoPreview, setMainPhotoPreview] = useState(null);
    const [instructionPhotoPreviews, setInstructionPhotoPreviews] = useState({});

    // Правила валидации
    const validationRules = getRecipeValidationRules();

    const { control, handleSubmit, register, setValue, formState: { errors } } = useForm({
        defaultValues: {
            ingredients: [{ name: '', quantity: '' }],
            instructions: [{ step_number: 1, description: '', photo: null }],
            difficulty: '',
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
        if (instructionFields.length < RECIPE_VALIDATION_CONSTANTS.INSTRUCTIONS_MAX_COUNT) {
            const nextStepNumber = instructionFields.length + 1;
            appendInstruction({ step_number: nextStepNumber, description: '', photo: null });
        }
    };

    // Обработка главного фото
    const handleMainPhotoChange = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setMainPhotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            setMainPhotoPreview(null);
        }
    };

    // Обработка фото инструкций
    const handleInstructionPhotoChange = (index, file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setInstructionPhotoPreviews(prev => ({
                    ...prev,
                    [index]: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setInstructionPhotoPreviews(prev => {
                const newPreviews = { ...prev };
                delete newPreviews[index];
                return newPreviews;
            });
        }
    };

    // Удаление фото инструкции
    const handleRemoveInstructionPhoto = (index) => {
        setValue(`instructions.${index}.photo`, null);
        setInstructionPhotoPreviews(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[index];
            return newPreviews;
        });
    };

    const onSubmit = (data) => {
        // Валидация тегов
        if (!validateAllTags()) {
            return;
        }

        // Валидация ингредиентов
        const ingredientsValidation = validateIngredients(data.ingredients);
        if (ingredientsValidation !== true) {
            toast({
                variant: 'destructive',
                title: 'Ошибка валидации',
                description: ingredientsValidation,
            });
            return;
        }

        // Валидация инструкций
        const instructionsValidation = validateInstructions(data.instructions);
        if (instructionsValidation !== true) {
            toast({
                variant: 'destructive',
                title: 'Ошибка валидации',
                description: instructionsValidation,
            });
            return;
        }

        try {
            addRecipe({ ...data, tags });
            toast({
                title: "Рецепт успешно добавлен",
                description: "Ваш рецепт был сохранен.",
            });
            router.push('/');
        } catch (error) {
            const { message, type } = handleApiError(error);
            toast({
                variant: type,
                title: "Ошибка",
                description: message,
            });
        }
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
                            {...register('title', validationRules.title)}
                            type="text"
                            placeholder="Введите название рецепта"
                            maxLength={RECIPE_VALIDATION_CONSTANTS.TITLE_MAX_LENGTH}
                            minLength={RECIPE_VALIDATION_CONSTANTS.TITLE_MIN_LENGTH}
                        />
                        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Описание</Label>
                        <Textarea
                            {...register('short_description', validationRules.short_description)}
                            rows={2}
                            placeholder="Краткое описание рецепта"
                            minLength={RECIPE_VALIDATION_CONSTANTS.DESCRIPTION_MIN_LENGTH}
                            maxLength={RECIPE_VALIDATION_CONSTANTS.DESCRIPTION_MAX_LENGTH}
                        />
                        {errors.short_description && <p className="text-destructive text-sm">{errors.short_description.message}</p>}
                    </div>

                    {/* Теги */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Теги</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="text-muted-foreground hover:text-primary">
                                            <Info className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Подбирайте теги тщательнее, они влияют на продвижение вашего рецепта</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <RecipeTagsInput
                            tags={tags}
                            tagInput={tagInput}
                            tagError={tagError}
                            onTagInputChange={setTagInput}
                            onAddTag={addTag}
                            onRemoveTag={removeTag}
                            onTagInputKeyPress={handleTagInputKeyPress}
                            canAddMoreTags={canAddMoreTags}
                            maxTagsCount={maxTagsCount}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Время приготовления (в минутах)</Label>
                            <Input
                                {...register('cook_time_minutes', validationRules.cook_time_minutes)}
                                type="number"
                                placeholder="Например: 60"
                                max={RECIPE_VALIDATION_CONSTANTS.COOK_TIME_MAX}
                                min={1}
                            />
                            {errors.cook_time_minutes && <p className="text-destructive text-sm">{errors.cook_time_minutes.message}</p>}
                        </div>

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
                        {errors.difficulty && <p className="text-destructive text-sm">{errors.difficulty.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Фото блюда</Label>
                        <Controller
                            name="main_photo"
                            control={control}
                            rules={{ required: 'Фото обязательно' }}
                            render={({ field }) => (
                                <div className="space-y-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            field.onChange(file);
                                            handleMainPhotoChange(file);
                                        }}
                                        placeholder="Загрузите фото блюда"
                                    />
                                    {mainPhotoPreview && (
                                        <div className="relative inline-block">
                                            <img 
                                                src={mainPhotoPreview} 
                                                alt="Превью главного фото" 
                                                className="w-32 h-32 object-cover rounded-lg border" 
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    field.onChange(null);
                                                    setMainPhotoPreview(null);
                                                }}
                                                className="absolute -top-2 -right-2 text-destructive hover:text-destructive/80 bg-background border rounded-full w-6 h-6 p-0"
                                            >
                                                &times;
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                        {errors.main_photo && <p className="text-destructive text-sm">{errors.main_photo.message}</p>}
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
                            if (ingredientFields.length < RECIPE_VALIDATION_CONSTANTS.INGREDIENTS_MAX_COUNT) {
                            appendIngredient({ name: '', quantity: '' });
                            }
                        }}
                        disabled={ingredientFields.length >= RECIPE_VALIDATION_CONSTANTS.INGREDIENTS_MAX_COUNT}
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
                            {...register(`ingredients.${index}.name`, validationRules.ingredientName)}
                            type="text"
                            placeholder="Название (например, Мука)"
                            minLength={RECIPE_VALIDATION_CONSTANTS.INGREDIENT_NAME_MIN_LENGTH}
                            maxLength={RECIPE_VALIDATION_CONSTANTS.INGREDIENT_NAME_MAX_LENGTH}
                        />
                        <Input
                            {...register(`ingredients.${index}.quantity`, validationRules.ingredientQuantity)}
                            type="text"
                            placeholder="Количество (например, 200 г)"
                            maxLength={RECIPE_VALIDATION_CONSTANTS.INGREDIENT_QUANTITY_MAX_LENGTH}
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
                    {/* Показать ошибки валидации для ингредиентов */}
                    {Object.keys(errors).some(key => key.startsWith('ingredients.')) && (
                        <div className="space-y-1">
                            {ingredientFields.map((_, index) => (
                                <div key={index}>
                                    {errors.ingredients?.[index]?.name && (
                                        <p className="text-destructive text-sm">
                                            Ингредиент {index + 1}: {errors.ingredients[index].name.message}
                                        </p>
                                    )}
                                    {errors.ingredients?.[index]?.quantity && (
                                        <p className="text-destructive text-sm">
                                            Ингредиент {index + 1}: {errors.ingredients[index].quantity.message}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                        {ingredientFields.length} из {RECIPE_VALIDATION_CONSTANTS.INGREDIENTS_MAX_COUNT} ингредиентов
                    </p>
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
                        disabled={instructionFields.length >= RECIPE_VALIDATION_CONSTANTS.INSTRUCTIONS_MAX_COUNT}
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
                                {...register(`instructions.${index}.description`, validationRules.instructionDescription)}
                                placeholder={`Шаг ${field.step_number}`}
                                rows={2}
                                maxLength={RECIPE_VALIDATION_CONSTANTS.INSTRUCTION_DESCRIPTION_MAX_LENGTH}
                            />
                            <div className="flex items-center gap-2">
                            <Controller
                                name={`instructions.${index}.photo`}
                                control={control}
                                render={({ field }) => (
                                <div className="flex flex-col gap-2 w-full">
                                    <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        field.onChange(file);
                                        handleInstructionPhotoChange(index, file);
                                    }}
                                    className="w-full"
                                    placeholder="Загрузите фото для шага"
                                    />
                                    {instructionPhotoPreviews[index] && (
                                        <div className="relative inline-block">
                                            <img 
                                                src={instructionPhotoPreviews[index]} 
                                                alt={`Превью шага ${index + 1}`} 
                                                className="w-24 h-24 object-cover rounded-lg border" 
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveInstructionPhoto(index)}
                                                className="absolute -top-2 -right-2 text-destructive hover:text-destructive/80 bg-background border rounded-full w-6 h-6 p-0"
                                            >
                                                &times;
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                )}
                            />
                            </div>
                        </div>
                        {instructionFields.length > 1 && (
                            <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                removeInstruction(index);
                                setInstructionPhotoPreviews(prev => {
                                    const newPreviews = { ...prev };
                                    delete newPreviews[index];
                                    return newPreviews;
                                });
                            }}
                            className="text-destructive hover:text-destructive/80 mt-2"
                            >
                            <Trash className="w-4 h-4" />
                            </Button>
                        )}
                        </div>
                    ))}
                    {/* Показать ошибки валидации для инструкций */}
                    {Object.keys(errors).some(key => key.startsWith('instructions.')) && (
                        <div className="space-y-1">
                            {instructionFields.map((_, index) => (
                                <div key={index}>
                                    {errors.instructions?.[index]?.description && (
                                        <p className="text-destructive text-sm">
                                            Шаг {index + 1}: {errors.instructions[index].description.message}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                        {instructionFields.length} из {RECIPE_VALIDATION_CONSTANTS.INSTRUCTIONS_MAX_COUNT} шагов
                    </p>
                </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg">
                Опубликовать рецепт
            </Button>

            <div className='text-center'>
                Нажимая на кнопку, вы даете согласие на <a className="text-blue-600 hover:underline" href='/docs/policy'>обработку персональных данных</a> и <a className="text-blue-600 hover:underline" href='/docs/recommendations-policy'>использование рекомендательных систем</a>.
            </div>
        </form>
    );
};

export default AddRecipeForm;