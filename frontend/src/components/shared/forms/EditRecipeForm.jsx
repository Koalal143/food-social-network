'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { useRecipes } from '@/context/RecipeContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ValidatedInput, { ValidatedTextarea } from "@/components/ui/ValidatedInput";
import { RecipeFormSkeleton } from "@/components/ui/skeletons";
import {
    validateImageFile,
    RECIPE_VALIDATION_CONSTANTS,
} from '@/lib/validation/recipe.validation';
import { RecipeValidationRules } from '@/lib/validation/recipeFormValidation';
import { useRecipeTags } from '@/hooks/useRecipeTags';
import RecipeTagsInput from './RecipeTagsInput';
import PhotoUploadInfo from '@/components/ui/PhotoUploadInfo';
import { handleApiError } from '@/utils/errorHandler';
import FileUploadProgress from '@/components/ui/FileUploadProgress';
import RecipePreview from './RecipePreview';
import { useWatch } from 'react-hook-form';

const EditRecipeForm = ({ slug, onSuccess }) => {
  const { getRecipeBySlug, updateRecipe } = useRecipes();
  const { user, loading: userLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [initialData, setInitialData] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

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
    setTagsFromExternal,
  } = useRecipeTags();

  const [mainPhotoPreview, setMainPhotoPreview] = useState(null);
  const [instructionPhotoPreviews, setInstructionPhotoPreviews] = useState({});

  const { control, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      title: '',
      short_description: '',
      difficulty: '',
      cook_time_minutes: 0,
      main_photo: null,
      ingredients: [{ name: '', quantity: '' }],
      instructions: [{ step_number: 1, description: '', photo: null }],
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

  const watchedData = useWatch({
    control,
    name: ['title', 'short_description', 'cook_time_minutes', 'difficulty']
  });

  // Получаем рецепт по slug
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const data = await getRecipeBySlug(slug, null);
        setInitialData(data);
        
        // Устанавливаем теги
        const normalizedTags = Array.isArray(data.tags)
          ? data.tags.map(tag => typeof tag === 'string' ? tag : tag.name)
          : [];
        setTagsFromExternal(normalizedTags);

        // Устанавливаем превью главного фото
        if (data.image_url) {
          setMainPhotoPreview(data.image_url);
        }

        // Устанавливаем превью фото инструкций
        if (data.instructions) {
          const previews = {};
          data.instructions.forEach((inst, index) => {
            if (inst.image_url) {
              previews[index] = inst.image_url;
            }
          });
          setInstructionPhotoPreviews(previews);
        }

      } catch (e) {
        setServerError(e.message || 'Ошибка загрузки рецепта');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [slug]);

  // Проверка доступа
  useEffect(() => {
    if (!userLoading && initialData && user) {
      const isAuthor = String(user.id) === String(initialData.author.id);
      const isSuperuser = user.is_superuser || user.role === 'admin';
      if (!isAuthor && !isSuperuser) {
        setAccessDenied(true);
        router.push('/');
      } else {
        setAccessDenied(false);
      }
    }
  }, [userLoading, initialData, user, router]);

  // Сброс формы при изменении initialData
  useEffect(() => {
    if (initialData) {
      const ingredients = Array.isArray(initialData.ingredients)
        ? initialData.ingredients.map(ing => ({
            name: typeof ing.name === 'string' ? ing.name : '',
            quantity: typeof ing.quantity === 'string' ? ing.quantity : '',
          }))
        : [{ name: '', quantity: '' }];

      const instructions = Array.isArray(initialData.instructions)
        ? initialData.instructions.map(inst => ({
            step_number: inst.step_number,
            description: typeof inst.description === 'string' ? inst.description : '',
            photo: null,
          }))
        : [{ step_number: 1, description: '', photo: null }];

      const formData = {
        title: initialData.title || '',
        short_description: initialData.short_description || '',
        difficulty: initialData.difficulty || '',
        cook_time_minutes: initialData.cook_time_minutes || 0,
        main_photo: null,
        ingredients,
        instructions,
      };

      reset(formData);

      // Используем setTimeout для обеспечения правильной гидратации
      setTimeout(() => {
        if (initialData.difficulty) {
          setValue('difficulty', initialData.difficulty, {
            shouldValidate: false,
            shouldDirty: false,
            shouldTouch: false
          });
        }
        setIsFormReady(true);
      }, 0);
    }
  }, [initialData, reset, setValue]);

  // Дополнительная синхронизация для production режима
  useEffect(() => {
    if (initialData && isFormReady && initialData.difficulty) {
      const currentValue = control._formValues?.difficulty;
      if (currentValue !== initialData.difficulty) {
        setValue('difficulty', initialData.difficulty, {
          shouldValidate: false,
          shouldDirty: false
        });
      }
    }
  }, [initialData, isFormReady, control, setValue]);

  // Обновление номеров шагов
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
      setMainPhotoPreview(initialData?.image_url || null);
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

    // Восстанавливаем исходное изображение, если оно было
    const originalInstruction = initialData?.instructions?.find(
      inst => inst.step_number === index + 1
    );

    if (originalInstruction?.image_url) {
      setInstructionPhotoPreviews(prev => ({
        ...prev,
        [index]: originalInstruction.image_url
      }));
    } else {
      setInstructionPhotoPreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[index];
        return newPreviews;
      });
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitted(true);

    if (!validateAllTags()) {
      return;
    }

    try {
      await updateRecipe({
        ...data,
        tags,
        id: initialData.id,
        slug: initialData.slug
      });
      toast({
        title: "Рецепт успешно обновлен",
        description: "Изменения были сохранены.",
      });
      router.push('/');
      if (onSuccess) onSuccess();
    } catch (error) {
      const { message, type } = handleApiError(error);
      toast({
        variant: type,
        title: "Ошибка",
        description: message,
      });
    }
  };

  if (loading || !isFormReady) return <RecipeFormSkeleton />;
  if (serverError) return <div className='text-destructive'>{serverError}</div>;
  if (accessDenied) return null;

  const formData = {
    title: watchedData[0],
    short_description: watchedData[1],
    cook_time_minutes: watchedData[2],
    difficulty: watchedData[3]
  };

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
      {/* Форма */}
      <div className="lg:col-span-8 w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/30 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl"></div>
        <div className="relative z-10 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Основная информация</h3>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Название рецепта</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <ValidatedInput
                  {...field}
                  placeholder="Введите название рецепта"
                  maxLength={RECIPE_VALIDATION_CONSTANTS.TITLE_MAX_LENGTH}
                  showErrors={isSubmitted}
                  validationRules={RecipeValidationRules.title}
                  className="bg-white/60 border-white/40 text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-white/60 transition-all backdrop-blur-sm h-8"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Описание</Label>
            <Controller
              name="short_description"
              control={control}
              render={({ field }) => (
                <ValidatedTextarea
                  {...field}
                  rows={2}
                  placeholder="Краткое описание рецепта"
                  maxLength={RECIPE_VALIDATION_CONSTANTS.DESCRIPTION_MAX_LENGTH}
                  showErrors={isSubmitted}
                  validationRules={RecipeValidationRules.short_description}
                  className="bg-white/60 border-white/40 text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-white/60 transition-all backdrop-blur-sm text-sm resize-none"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Время (мин)</Label>
              <Controller
                name="cook_time_minutes"
                control={control}
                render={({ field }) => (
                  <ValidatedInput
                    {...field}
                    type="number"
                    placeholder="60"
                    max={RECIPE_VALIDATION_CONSTANTS.COOK_TIME_MAX}
                    min={1}
                    showErrors={isSubmitted}
                    validationRules={RecipeValidationRules.cook_time_minutes}
                    className="bg-white/60 border-white/40 text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-white/60 transition-all backdrop-blur-sm h-8"
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Сложность</Label>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => {
                  const currentValue = field.value ?? '';
                  return (
                    <Select
                      key={`difficulty-${initialData?.difficulty || 'empty'}-${isFormReady}`}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={currentValue}
                      defaultValue={currentValue}
                    >
                      <SelectTrigger className="bg-white/60 border-white/40 text-gray-900 focus:bg-white/80 focus:border-white/60 transition-all backdrop-blur-sm h-8">
                        <SelectValue
                          placeholder="Выберите"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">Легко</SelectItem>
                        <SelectItem value="MEDIUM">Средне</SelectItem>
                        <SelectItem value="HARD">Сложно</SelectItem>
                      </SelectContent>
                    </Select>
                  );
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700">Теги</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-gray-500 hover:text-gray-700">
                      <Info className="w-3 h-3" />
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

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700">Фото блюда</Label>
              <PhotoUploadInfo
                recommendedSize="1200×800px (3:2)"
                maxFileSize="5MB"
                formats="PNG, JPG, JPEG"
                className="hidden md:block"
              />
            </div>
            <Controller
              name="main_photo"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <FileUploadProgress
                    onFileSelect={async (file) => {
                      const validation = validateImageFile(file);
                      if (validation !== true) {
                        toast({
                          variant: 'destructive',
                          title: 'Ошибка',
                          description: validation,
                        });
                        return;
                      }
                      field.onChange(file);
                      handleMainPhotoChange(file);
                    }}
                    accept="image/png,image/jpg,image/jpeg"
                    maxSize={5 * 1024 * 1024}
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      className="bg-white/60 border-white/40 text-gray-900 focus:bg-white/80 focus:border-white/60 transition-all backdrop-blur-sm h-8 w-full rounded-md border px-3 py-1 text-sm cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
                    />
                  </FileUploadProgress>
                  <PhotoUploadInfo
                    recommendedSize="1200×800px (3:2)"
                    maxFileSize="5MB"
                    formats="PNG, JPG, JPEG"
                    className="md:hidden"
                  />
                  {mainPhotoPreview && (
                    <div className="relative inline-block">
                      <img
                        src={mainPhotoPreview}
                        alt="Превью главного фото"
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          field.onChange(null);
                          setMainPhotoPreview(initialData?.image_url || null);
                        }}
                        className="absolute -top-1 -right-1 text-destructive hover:text-destructive/80 bg-background border rounded-full w-5 h-5 p-0 text-xs"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      </div>

      <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/30 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Ингредиенты</h3>
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
              className="h-7 px-2 text-xs bg-white/60 border-white/40 hover:bg-white/80"
            >
              <Plus className="w-3 h-3 mr-1" />
              Добавить
            </Button>
          </div>

          <div className="space-y-3">
            {ingredientFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 p-2 bg-gray-50/50 rounded-lg">
                <div className="flex-1">
                  <Controller
                    name={`ingredients.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <ValidatedInput
                        {...field}
                        placeholder="Название (например, Мука)"
                        maxLength={RECIPE_VALIDATION_CONSTANTS.INGREDIENT_NAME_MAX_LENGTH}
                        showErrors={isSubmitted}
                        validationRules={RecipeValidationRules.ingredientName}
                        className="bg-white/60 border-white/40 text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-white/60 transition-all backdrop-blur-sm h-8 text-sm"
                      />
                    )}
                  />
                </div>
                <div className="w-24">
                  <Controller
                    name={`ingredients.${index}.quantity`}
                    control={control}
                    render={({ field }) => (
                      <ValidatedInput
                        {...field}
                        placeholder="200 г"
                        maxLength={RECIPE_VALIDATION_CONSTANTS.INGREDIENT_QUANTITY_MAX_LENGTH}
                        showErrors={isSubmitted}
                        validationRules={RecipeValidationRules.ingredientQuantity}
                        className="bg-white/60 border-white/40 text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-white/60 transition-all backdrop-blur-sm h-8 text-sm"
                      />
                    )}
                  />
                </div>
                {ingredientFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                    className="text-destructive hover:text-destructive/80 h-8 w-8 p-0"
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>



          <p className="text-xs text-gray-600">
            {ingredientFields.length} из {RECIPE_VALIDATION_CONSTANTS.INGREDIENTS_MAX_COUNT} ингредиентов
          </p>
        </div>
      </div>

      <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/30 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Инструкция приготовления</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddInstruction}
              disabled={instructionFields.length >= RECIPE_VALIDATION_CONSTANTS.INSTRUCTIONS_MAX_COUNT}
              className="h-7 px-2 text-xs bg-white/60 border-white/40 hover:bg-white/80"
            >
              <Plus className="w-3 h-3 mr-1" />
              Добавить шаг
            </Button>
          </div>

          <div className="space-y-3">
            {instructionFields.map((field, index) => (
              <div key={field.id} className="p-2 bg-gray-50/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium text-xs">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-700">Шаг {index + 1}</span>
                  </div>
                  {instructionFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        removeInstruction(index);
                        setInstructionPhotoPreviews(prev => {
                          const newPreviews = { ...prev };
                          delete newPreviews[index];
                          return newPreviews;
                        });
                      }}
                      className="text-destructive hover:text-destructive/80 h-6 w-6 p-0"
                    >
                      <Trash className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <Controller
                  name={`instructions.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <ValidatedTextarea
                      {...field}
                      placeholder={`Опишите шаг ${index + 1}`}
                      rows={2}
                      maxLength={RECIPE_VALIDATION_CONSTANTS.INSTRUCTION_DESCRIPTION_MAX_LENGTH}
                      showErrors={isSubmitted}
                      validationRules={RecipeValidationRules.instructionDescription}
                      className="bg-white/60 border-white/40 text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-white/60 transition-all backdrop-blur-sm text-sm resize-none"
                    />
                  )}
                />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-600">Фото шага (необязательно)</Label>
                    <PhotoUploadInfo
                      recommendedSize="800×600px (4:3)"
                      maxFileSize="5MB"
                      formats="PNG, JPG, JPEG"
                      className="hidden md:block"
                    />
                  </div>
                  <Controller
                    name={`instructions.${index}.photo`}
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/png,image/jpg,image/jpeg"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const validation = validateImageFile(file);
                              if (validation !== true) {
                                toast({
                                  variant: 'destructive',
                                  title: 'Ошибка',
                                  description: validation,
                                });
                                return;
                              }
                            }
                            field.onChange(file);
                            handleInstructionPhotoChange(index, file);
                          }}
                          className="bg-white/60 border-white/40 text-gray-900 focus:bg-white/80 focus:border-white/60 transition-all backdrop-blur-sm h-8 w-full rounded-md border px-3 py-1 text-sm cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
                        />
                        <PhotoUploadInfo
                          recommendedSize="800×600px (4:3)"
                          maxFileSize="5MB"
                          formats="PNG, JPG, JPEG"
                          className="md:hidden"
                        />
                        {instructionPhotoPreviews[index] && (
                          <div className="relative inline-block">
                            <img
                              src={instructionPhotoPreviews[index]}
                              alt={`Превью шага ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveInstructionPhoto(index)}
                              className="absolute -top-1 -right-1 text-destructive hover:text-destructive/80 bg-background border rounded-full w-5 h-5 p-0 text-xs"
                            >
                              ×
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>



          <p className="text-xs text-gray-600">
            {instructionFields.length} из {RECIPE_VALIDATION_CONSTANTS.INSTRUCTIONS_MAX_COUNT} шагов
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1 h-9" disabled={!tags.length}>
          Сохранить изменения
        </Button>
        <Button type="button" variant="outline" className="h-9 px-6" onClick={() => router.push('/')}>
          Отмена
        </Button>
      </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">
              Нажимая на кнопку, вы даете согласие на{' '}
              <a className="text-primary hover:underline" href="/docs/policy">
                обработку персональных данных
              </a>
              {' '}и{' '}
              <a className="text-primary hover:underline" href="/docs/recommendations-policy">
                использование рекомендательных систем
              </a>
              .
            </p>
          </div>
        </form>
      </div>

      {/* Превью - только на десктопе */}
      <div className="hidden lg:block lg:col-span-4">
        <div className="sticky top-20">
          <RecipePreview
            formData={formData}
            mainPhotoPreview={mainPhotoPreview}
            isVisible={true}
          />
        </div>
      </div>
    </div>
  );
};

export default EditRecipeForm;