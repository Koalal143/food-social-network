'use client'

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRecipes } from '@/context/RecipeContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext';

const EditRecipeForm = ({ slug, onSuccess }) => {
  const { getRecipeBySlug, updateRecipe } = useRecipes();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [initialData, setInitialData] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState('');
  const { user, loading: userLoading } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);
  const router = useRouter();

  // Получаем рецепт по slug
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const data = await getRecipeBySlug(slug, null);
        setInitialData(data);
        setTags(data.tags.map(tag => typeof tag === 'string' ? { name: tag } : tag));
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
      console.log(user);
      
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

  // Инициализация формы только после загрузки данных
  const { control, handleSubmit, register, setValue, reset, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  // Сброс формы при изменении initialData
  useEffect(() => {
    if (initialData) {
      // Нормализация tags (массив строк)
      const tags = Array.isArray(initialData.tags)
        ? initialData.tags.map(tag => typeof tag === 'string' ? tag : tag.name)
        : [];
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
            photo: null,
          }))
        : [{ step_number: 1, description: '', photo: null }];
      reset({
        ...initialData,
        tags: tags.map(tag => typeof tag === 'string' ? { name: tag } : tag),
        ingredients,
        instructions,
      });
      setTags(tags.map(tag => typeof tag === 'string' ? { name: tag } : tag));
    }
  }, [initialData, reset]);

  // useFieldArray для ингредиентов и инструкций
  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients',
  });
  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control,
    name: 'instructions',
  });

  // Валидация (можно вынести из AddRecipeForm)
  const validateTitle = (value) => {
    if (!value) return 'Название обязательно';
    if (value.length > 135) return 'Название не должно превышать 135 символов';
    const trimmed = value.trim();
    if (trimmed.indexOf(' ') === -1 && trimmed.length > 25) {
      return 'Название не должно быть одним длинным словом (>25 символов)';
    }
    return true;
  };
  const validateDescription = (value) => {
    if (!value) return 'Описание обязательно';
    if (value.length > 255) return 'Описание не должно превышать 255 символов';
    return true;
  };
  const validateCookTime = (value) => {
    if (!value) return 'Время обязательно';
    const num = Number(value);
    if (isNaN(num) || num <= 0) return 'Время должно быть больше 0';
    if (num >= 1440) return 'Время не должно превышать 24 часа (1440 минут)';
    return true;
  };

  // Тэги
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
    setTags([...tags, { name: newTag }]);
    setTagInput('');
    setTagError('');
  };
  const handleRemoveTag = (idx) => {
    setTags(tags.filter((_, i) => i !== idx));
    setTagError('');
  };

  // Отправка изменений на сервер
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
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Максимум 50 ингредиентов' });
      return;
    }
    if (data.instructions.length > 50) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Максимум 50 шагов инструкции' });
      return;
    }
    try {
      await updateRecipe({ ...data, tags: tags.map(tag => tag.name), id: initialData.id });
      toast({ title: 'Рецепт обновлён', description: 'Изменения успешно сохранены.' });
      if (onSuccess) onSuccess();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка', description: e.message });
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (serverError) return <div className='text-destructive'>{serverError}</div>;
  if (accessDenied) return null;

  return (
    <Card className="space-y-6">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2 pt-6">
            <Label>Название рецепта</Label>
            <Input {...register('title', { validate: validateTitle })} type="text" />
            {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea {...register('short_description', { validate: validateDescription })} rows={3} />
            {errors.short_description && <p className="text-destructive text-sm">{errors.short_description.message}</p>}
          </div>
          {/* --- Конструктор тэгов --- */}
          <div className="space-y-2">
            <Label>Тэги</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="Введите тэг и нажмите Enter или +"
                maxLength={30}
              />
              <Button type="button" onClick={handleAddTag} disabled={tags.length >= 15}>+</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, idx) => (
                <span key={idx} className="bg-primary/10 px-2 py-1 rounded flex items-center gap-1">
                  {tag.name}
                  <button type="button" className="ml-1 text-destructive" onClick={() => handleRemoveTag(idx)}>&times;</button>
                </span>
              ))}
            </div>
            {tagError && <p className="text-destructive text-sm">{tagError}</p>}
          </div>
          {/* --- Остальные поля: время, ингредиенты, инструкции, фото и т.д. --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Время приготовления (в минутах)</Label>
              <Input
                {...register('cook_time_minutes', { validate: validateCookTime })}
                type="number"
                placeholder="Например: 60"
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
                  <Select {...field}>
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
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => field.onChange(e.target.files[0])}
                  placeholder="Загрузите фото блюда"
                />
              )}
            />
            {errors.main_photo && <p className="text-destructive text-sm">{errors.main_photo.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Ингредиенты</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => {
                if (ingredientFields.length < 50) appendIngredient({ name: '', quantity: '' });
              }} disabled={ingredientFields.length >= 50}>Добавить ингредиент</Button>
            </div>
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
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)} className="text-destructive hover:text-destructive/80">
                    &times;
                  </Button>
                )}
              </div>
            ))}
            {ingredientFields.length > 50 && <p className="text-destructive text-sm">Максимум 50 ингредиентов</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Инструкция приготовления</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => {
                if (instructionFields.length < 25) appendInstruction({ step_number: instructionFields.length + 1, description: '', photo: null });
              }} disabled={instructionFields.length >= 25}>Добавить шаг</Button>
            </div>
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
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={e => field.onChange(e.target.files[0])}
                          className="w-full"
                          placeholder="Загрузите фото для шага"
                        />
                      )}
                    />
                    {field.photo && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setValue(`instructions.${index}.photo`, null)} className="text-destructive hover:text-destructive/80">Удалить фото</Button>
                    )}
                  </div>
                </div>
                {instructionFields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeInstruction(index)} className="text-destructive hover:text-destructive/80 mt-2">&times;</Button>
                )}
              </div>
            ))}
            {instructionFields.length > 50 && <p className="text-destructive text-sm">Максимум 50 шагов</p>}
          </div>
          <Button type="submit" className="w-full" size="lg">Сохранить изменения</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditRecipeForm;
