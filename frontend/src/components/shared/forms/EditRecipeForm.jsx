'use client';

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
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const EditRecipeForm = ({ slug, onSuccess }) => {
  const { getRecipeBySlug, updateRecipe } = useRecipes();
  const { user, loading: userLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Состояния для загрузки и данных
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [initialData, setInitialData] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Локальный стейт для тэгов
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState("");

  // Состояния для превью фотографий
  const [mainPhotoPreview, setMainPhotoPreview] = useState(null);
  const [instructionPhotoPreviews, setInstructionPhotoPreviews] = useState({});

  const { control, handleSubmit, register, setValue, reset, formState: { errors } } = useForm({
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
        setTags(normalizedTags);

        // Устанавливаем превью главного фото
        if (data.main_photo) {
          setMainPhotoPreview(data.main_photo);
        }

        // Устанавливаем превью фото инструкций
        if (data.instructions) {
          const previews = {};
          data.instructions.forEach((inst, index) => {
            if (inst.photo) {
              previews[index] = inst.photo;
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
      // Нормализация ингредиентов
      const ingredients = Array.isArray(initialData.ingredients)
        ? initialData.ingredients.map(ing => ({
            name: typeof ing.name === 'string' ? ing.name : '',
            quantity: typeof ing.quantity === 'string' ? ing.quantity : '',
          }))
        : [{ name: '', quantity: '' }];

      // Нормализация инструкций
      const instructions = Array.isArray(initialData.instructions)
        ? initialData.instructions.map(inst => ({
            step_number: inst.step_number,
            description: typeof inst.description === 'string' ? inst.description : '',
            photo: null, // Не загружаем файлы в форму, только превью
          }))
        : [{ step_number: 1, description: '', photo: null }];

      reset({
        ...initialData,
        ingredients,
        instructions,
      });
    }
  }, [initialData, reset]);

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
    if (instructionFields.length < 25) {
      const nextStepNumber = instructionFields.length + 1;
      appendInstruction({ step_number: nextStepNumber, description: '', photo: null });
    }
  };

  // Валидация названия
  const validateTitle = (value) => {
    if (!value) return 'Название обязательно';
    if (value.length > 135) return 'Название не должно превышать 135 символов';
    const trimmed = value.trim();
    if (trimmed.indexOf(' ') === -1 && trimmed.length > 25) {
      return 'Название не должно быть одним длинным словом (>25 символов)';
    }
    return true;
  };

  // Валидация описания
  const validateDescription = (value) => {
    if (!value) return 'Описание обязательно';
    if (value.length > 255) return 'Описание не должно превышать 255 символов';
    return true;
  };

  // Валидация времени
  const validateCookTime = (value) => {
    if (!value) return 'Время обязательно';
    const num = Number(value);
    if (isNaN(num) || num <= 0) return 'Время должно быть больше 0';
    if (num >= 1440) return 'Время не должно превышать 24 часа (1440 минут)';
    return true;
  };

  // Функции для работы с тэгами
  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (!newTag) return;
    if (tags.length >= 15) {
      setTagError('Максимум 15 тэгов');
      return;
    }
    if (newTag.length > 30) {
      setTagError('Тэг не должен превышать 30 символов');
      return;
    }
    if (tags.includes(newTag)) {
      setTagError('Такой тэг уже добавлен');
      return;
    }
    setTags([...tags, newTag]);
    setTagInput("");
    setTagError("");
  };

  const handleRemoveTag = (idx) => {
    setTags(tags.filter((_, i) => i !== idx));
    setTagError("");
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
      setMainPhotoPreview(initialData?.main_photo || null);
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

  const onSubmit = async (data) => {
    if (tags.length === 0) {
      setTagError('Добавьте хотя бы один тэг');
      return;
    }
    if (tags.length > 15) {
      setTagError('Максимум 15 тэгов');
      return;
    }
    if (data.ingredients.length > 50) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Максимум 50 ингредиентов',
      });
      return;
    }
    if (data.instructions.length > 50) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Максимум 50 шагов инструкции',
      });
      return;
    }

    try {
      await updateRecipe({ ...data, tags, id: initialData.id });
      toast({
        title: "Рецепт успешно обновлен",
        description: "Изменения были сохранены.",
      });
      router.push('/')
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Ошибка",
        description: error.message || "Произошла ошибка при обновлении рецепта",
      });
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (serverError) return <div className='text-destructive'>{serverError}</div>;
  if (accessDenied) return null;

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
              {...register('title', { validate: validateTitle })}
              type="text"
              placeholder="Введите название рецепта"
              maxLength={135}
              minLength={3}
            />
            {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              {...register('short_description', { validate: validateDescription })}
              rows={2}
              placeholder="Краткое описание рецепта"
              minLength={3}
              maxLength={255}
            />
            {errors.short_description && <p className="text-destructive text-sm">{errors.short_description.message}</p>}
          </div>

          {/* Конструктор тэгов */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Тэги</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-primary">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Подбирайте тэги тщательнее, они влияют на продвижение вашего рецепта</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }}}
                placeholder="Введите тэг и нажмите Enter или +"
                minLength={2}
                maxLength={50}
              />
              <Button type="button" onClick={handleAddTag} disabled={tags.length >= 15}>+</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, idx) => (
                <span key={idx} className="bg-primary/10 px-2 py-1 rounded flex items-center gap-1">
                  {tag}
                  <button type="button" className="ml-1 text-destructive" onClick={() => handleRemoveTag(idx)}>&times;</button>
                </span>
              ))}
            </div>
            {tagError && <p className="text-destructive text-sm">{tagError}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Время приготовления (в минутах)</Label>
              <Input
                {...register('cook_time_minutes', { validate: validateCookTime })}
                type="number"
                placeholder="Например: 60"
                max={1440}
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
                minLength={2}
                maxLength={135}
              />
              <Input
                {...register(`ingredients.${index}.quantity`, { required: 'Количество обязательно' })}
                type="text"
                placeholder="Количество (например, 200 г)"
                maxLength={30}
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
          {ingredientFields.length > 50 && <p className="text-destructive text-sm">Максимум 50 ингредиентов</p>}
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
                  minLength={2}
                  maxLength={255}
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
          {instructionFields.length > 50 && <p className="text-destructive text-sm">Максимум 50 шагов</p>}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg">
        Сохранить изменения
      </Button>

      <div className='text-center'>
        Нажимая на кнопку, вы даете согласие на <a className="text-blue-600 hover:underline" href='/docs/policy'>обработку персональных данных</a>.
      </div>
    </form>
  );
};

export default EditRecipeForm;

// 'use client'

// import { useEffect, useState } from 'react';
// import { useForm, useFieldArray, Controller } from 'react-hook-form';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { useToast } from '@/hooks/use-toast';
// import { useRecipes } from '@/context/RecipeContext';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";
// import { useUser } from '@/context/UserContext';
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/context/AuthContext';

// const EditRecipeForm = ({ slug, onSuccess }) => {
//     const { getRecipeBySlug, updateRecipe } = useRecipes();
//     const { toast } = useToast();
//     const [loading, setLoading] = useState(true);
//     const [serverError, setServerError] = useState('');
//     const [initialData, setInitialData] = useState(null);
//     const [tags, setTags] = useState([]);
//     const [tagInput, setTagInput] = useState('');
//     const [tagError, setTagError] = useState('');
//     const { user, loading: userLoading } = useAuth();
//     const [accessDenied, setAccessDenied] = useState(false);
//     const router = useRouter();

//     // Получаем рецепт по slug
//     useEffect(() => {
//         const fetchRecipe = async () => {
//             try {
//                 setLoading(true);
//                 const data = await getRecipeBySlug(slug, null);
//                 setInitialData(data);
//                 setTags(data.tags.map(tag => typeof tag === 'string' ? { name: tag } : tag));
//             } catch (e) {
//                 setServerError(e.message || 'Ошибка загрузки рецепта');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchRecipe();
//     }, [slug]);

//     // Проверка доступа
//     useEffect(() => {
//         if (!userLoading && initialData && user) {
//             const isAuthor = String(user.id) === String(initialData.author.id);
//             const isSuperuser = user.is_superuser || user.role === 'admin';
//             if (!isAuthor && !isSuperuser) {
//                 setAccessDenied(true);
//                 router.push('/');
//             } else {
//                 setAccessDenied(false);
//             }
//         }
//     }, [userLoading, initialData, user, router]);

//     // Инициализация формы только после загрузки данных
//     const { control, handleSubmit, register, setValue, reset, formState: { errors } } = useForm({
//         defaultValues: initialData
//     });

//     // Сброс формы при изменении initialData
//     useEffect(() => {
//         if (initialData) {
//             // Нормализация tags (массив строк)
//             const tags = Array.isArray(initialData.tags)
//                 ? initialData.tags.map(tag => typeof tag === 'string' ? tag : tag.name)
//                 : [];
//             // Нормализация ингредиентов
//             const ingredients = Array.isArray(initialData.ingredients)
//                 ? initialData.ingredients.map(ing => ({
//                     name: typeof ing.name === 'string' ? ing.name : '',
//                     quantity: typeof ing.quantity === 'string' ? ing.quantity : '',
//                 }))
//                 : [{ name: '', quantity: '' }];
//             // Нормализация инструкций
//             const instructions = Array.isArray(initialData.instructions)
//                 ? initialData.instructions.map(inst => ({
//                     step_number: inst.step_number,
//                     description: typeof inst.description === 'string' ? inst.description : '',
//                     photo: null,
//                 }))
//                 : [{ step_number: 1, description: '', photo: null }];
//             reset({
//                 ...initialData,
//                 tags: tags.map(tag => typeof tag === 'string' ? { name: tag } : tag),
//                 ingredients,
//                 instructions,
//             });
//             setTags(tags.map(tag => typeof tag === 'string' ? { name: tag } : tag));
//         }
//     }, [initialData, reset]);

//     // useFieldArray для ингредиентов и инструкций
//     const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
//         control,
//         name: 'ingredients',
//     });
//     const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
//         control,
//         name: 'instructions',
//     });

//     // Валидация (можно вынести из AddRecipeForm)
//     const validateTitle = (value) => {
//         if (!value) return 'Название обязательно';
//         if (value.length > 135) return 'Название не должно превышать 135 символов';
//         const trimmed = value.trim();
//         if (trimmed.indexOf(' ') === -1 && trimmed.length > 25) {
//         return 'Название не должно быть одним длинным словом (>25 символов)';
//         }
//         return true;
//     };
//     const validateDescription = (value) => {
//         if (!value) return 'Описание обязательно';
//         if (value.length > 255) return 'Описание не должно превышать 255 символов';
//         return true;
//     };
//     const validateCookTime = (value) => {
//         if (!value) return 'Время обязательно';
//         const num = Number(value);
//         if (isNaN(num) || num <= 0) return 'Время должно быть больше 0';
//         if (num >= 1440) return 'Время не должно превышать 24 часа (1440 минут)';
//         return true;
//     };

//     // Тэги
//     const handleAddTag = () => {
//         const newTag = tagInput.trim();
//         if (!newTag) return;
//         if (tags.length >= 15) {
//             setTagError('Максимум 15 тэгов');
//             return;
//         }
//         if (newTag.length > 30) {
//             setTagError('Тэг не должен превышать 30 символов');
//             return;
//         }
//         if (tags.includes(newTag)) {
//             setTagError('Такой тэг уже добавлен');
//             return;
//         }
//         setTags([...tags, { name: newTag }]);
//         setTagInput('');
//         setTagError('');
//     };
//     const handleRemoveTag = (idx) => {
//         setTags(tags.filter((_, i) => i !== idx));
//         setTagError('');
//     };

//     // Отправка изменений на сервер
//     const onSubmit = async (data) => {
//         if (tags.length === 0) {
//             setTagError('Добавьте хотя бы один тэг');
//             return;
//         }
//         if (tags.length > 15) {
//             setTagError('Максимум 15 тэгов');
//             return;
//         }
//         if (data.ingredients.length > 50) {
//             toast({ variant: 'destructive', title: 'Ошибка', description: 'Максимум 50 ингредиентов' });
//             return;
//         }
//         if (data.instructions.length > 50) {
//             toast({ variant: 'destructive', title: 'Ошибка', description: 'Максимум 50 шагов инструкции' });
//             return;
//         }
//         try {
//             await updateRecipe({ ...data, tags: tags.map(tag => tag.name), id: initialData.id });
//             toast({ title: 'Рецепт обновлён', description: 'Изменения успешно сохранены.' });
//         if (onSuccess) onSuccess();
//         } catch (e) {
//             toast({ variant: 'destructive', title: 'Ошибка', description: e.message });
//         }
//     };

//     if (loading) return <div>Загрузка...</div>;
//     if (serverError) return <div className='text-destructive'>{serverError}</div>;
//     if (accessDenied) return null;

//     return (
//         <Card className="space-y-6">
//             <CardContent>
//                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//                     <div className="space-y-2 pt-6">
//                         <Label>Название рецепта</Label>
//                         <Input {...register('title', { validate: validateTitle })} type="text" />
//                         {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
//                     </div>
//                     <div className="space-y-2">
//                         <Label>Описание</Label>
//                         <Textarea {...register('short_description', { validate: validateDescription })} rows={3} />
//                         {errors.short_description && <p className="text-destructive text-sm">{errors.short_description.message}</p>}
//                     </div>
//                     {/* --- Конструктор тэгов --- */}
//                     <div className="space-y-2">
//                         <Label>Тэги</Label>
//                         <div className="flex gap-2">
//                         <Input
//                             value={tagInput}
//                             onChange={e => setTagInput(e.target.value)}
//                             onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
//                             placeholder="Введите тэг и нажмите Enter или +"
//                             maxLength={30}
//                         />
//                         <Button type="button" onClick={handleAddTag} disabled={tags.length >= 15}>+</Button>
//                         </div>
//                         <div className="flex flex-wrap gap-2 mt-2">
//                         {tags.map((tag, idx) => (
//                             <span key={idx} className="bg-primary/10 px-2 py-1 rounded flex items-center gap-1">
//                             {tag.name}
//                             <button type="button" className="ml-1 text-destructive" onClick={() => handleRemoveTag(idx)}>&times;</button>
//                             </span>
//                         ))}
//                         </div>
//                         {tagError && <p className="text-destructive text-sm">{tagError}</p>}
//                     </div>
//                     {/* --- Остальные поля: время, ингредиенты, инструкции, фото и т.д. --- */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                         <Label>Время приготовления (в минутах)</Label>
//                         <Input
//                             {...register('cook_time_minutes', { validate: validateCookTime })}
//                             type="number"
//                             placeholder="Например: 60"
//                         />
//                         {errors.cook_time_minutes && <p className="text-destructive text-sm">{errors.cook_time_minutes.message}</p>}
//                         </div>
//                         <div className="space-y-2">
//                         <Label>Сложность</Label>
//                         <Controller
//                             name="difficulty"
//                             control={control}
//                             rules={{ required: 'Сложность обязательна' }}
//                             render={({ field }) => (
//                             <Select {...field}>
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Выберите сложность" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="EASY">Легко</SelectItem>
//                                     <SelectItem value="MEDIUM">Средне</SelectItem>
//                                     <SelectItem value="HARD">Сложно</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                             )}
//                         />
//                         {errors.difficulty && <p className="text-destructive text-sm">{errors.difficulty.message}</p>}
//                         </div>
//                     </div>
//                     <div className="space-y-2">
//                         <Label>Фото блюда</Label>
//                         <Controller
//                         name="main_photo"
//                         control={control}
//                         render={({ field }) => (
//                             <Input
//                                 type="file"
//                                 accept="image/*"
//                                 onChange={e => field.onChange(e.target.files[0])}
//                                 placeholder="Загрузите фото блюда"
//                             />
//                         )}
//                         />
//                         {errors.main_photo && <p className="text-destructive text-sm">{errors.main_photo.message}</p>}
//                     </div>
//                     <div className="space-y-2">
//                         <div className="flex items-center justify-between">
//                         <Label>Ингредиенты</Label>
//                         <Button type="button" variant="outline" size="sm" onClick={() => {
//                             if (ingredientFields.length < 50) appendIngredient({ name: '', quantity: '' });
//                         }} disabled={ingredientFields.length >= 50}>Добавить ингредиент</Button>
//                         </div>
//                         {ingredientFields.map((field, index) => (
//                         <div key={field.id} className="flex items-center gap-2">
//                             <Input
//                                 {...register(`ingredients.${index}.name`, { required: 'Название обязательно' })}
//                                 type="text"
//                                 placeholder="Название (например, Мука)"
//                             />
//                             <Input
//                                 {...register(`ingredients.${index}.quantity`, { required: 'Количество обязательно' })}
//                                 type="text"
//                                 placeholder="Количество (например, 200 г)"
//                             />
//                             {ingredientFields.length > 1 && (
//                             <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)} className="text-destructive hover:text-destructive/80">
//                                 &times;
//                             </Button>
//                             )}
//                         </div>
//                         ))}
//                         {ingredientFields.length > 50 && <p className="text-destructive text-sm">Максимум 50 ингредиентов</p>}
//                     </div>
//                     <div className="space-y-2">
//                         <div className="flex items-center justify-between">
//                         <Label>Инструкция приготовления</Label>
//                         <Button type="button" variant="outline" size="sm" onClick={() => {
//                             if (instructionFields.length < 25) appendInstruction({ step_number: instructionFields.length + 1, description: '', photo: null });
//                         }} disabled={instructionFields.length >= 25}>Добавить шаг</Button>
//                         </div>
//                         {instructionFields.map((field, index) => (
//                         <div key={field.id} className="flex items-start gap-2">
//                             <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium mt-2">
//                             {index + 1}
//                             </div>
//                             <div className="flex-1 space-y-2">
//                             <Textarea
//                                 {...register(`instructions.${index}.description`, { required: 'Текст шага обязателен' })}
//                                 placeholder={`Шаг ${field.step_number}`}
//                                 rows={2}
//                             />
//                             <div className="flex items-center gap-2">
//                                 <Controller
//                                 name={`instructions.${index}.photo`}
//                                 control={control}
//                                 render={({ field }) => (
//                                     <Input
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={e => field.onChange(e.target.files[0])}
//                                     className="w-full"
//                                     placeholder="Загрузите фото для шага"
//                                     />
//                                 )}
//                                 />
//                                 {field.photo && (
//                                     <Button type="button" variant="ghost" size="sm" onClick={() => setValue(`instructions.${index}.photo`, null)} className="text-destructive hover:text-destructive/80">Удалить фото</Button>
//                                 )}
//                             </div>
//                             </div>
//                             {instructionFields.length > 1 && (
//                                 <Button type="button" variant="ghost" size="icon" onClick={() => removeInstruction(index)} className="text-destructive hover:text-destructive/80 mt-2">&times;</Button>
//                             )}
//                         </div>
//                         ))}
//                         {instructionFields.length > 50 && <p className="text-destructive text-sm">Максимум 50 шагов</p>}
//                     </div>
//                     <Button type="submit" className="w-full" size="lg">Сохранить изменения</Button>

//                     <div className='text-center'>
//                         Нажимая на кнопку, вы даете согласие на <a className="text-blue-600 hover:underline" href='/docs/policy'>обработку персональных данных</a>.
//                     </div>
//                 </form>
//             </CardContent>
//         </Card>
//     );
// };

// export default EditRecipeForm;