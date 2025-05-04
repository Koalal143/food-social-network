'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Plus, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';

const AddRecipeForm = () => {
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [stepPhotos, setStepPhotos] = useState([null]);

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    } else {
      useToast({
        title: "Ошибка",
        description: "Должен быть хотя бы один ингредиент",
        variant: "destructive",
      });
    }
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
    setStepPhotos([...stepPhotos, null]);
  };

  const removeInstruction = (index) => {
    if (instructions.length > 1) {
      const newInstructions = instructions.filter((_, i) => i !== index);
      const newPhotos = stepPhotos.filter((_, i) => i !== index);
      setInstructions(newInstructions);
      setStepPhotos(newPhotos);
    } else {
      toast({
        title: "Ошибка",
        description: "Должен быть хотя бы один шаг приготовления",
        variant: "destructive",
      });
    }
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handlePhotoChange = (index, file) => {
    const newPhotos = [...stepPhotos];
    newPhotos[index] = file;
    setStepPhotos(newPhotos);
  };

  const removePhoto = (index) => {
    const newPhotos = [...stepPhotos];
    newPhotos[index] = null;
    setStepPhotos(newPhotos);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Логика отправки данных на сервер
    console.log('Form submitted');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Название рецепта</Label>
            <Input type="text" required placeholder="Введите название рецепта" />
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea required rows={3} placeholder="Краткое описание рецепта" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Время приготовления</Label>
              <Input type="text" required placeholder="например: 1 ч 30 мин" />
            </div>

            <div className="space-y-2">
              <Label>Количество порций</Label>
              <Input type="number" required min="1" placeholder="2" />
            </div>

            <div className="space-y-2">
              <Label>Сложность</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сложность" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Легко">Легко</SelectItem>
                  <SelectItem value="Средне">Средне</SelectItem>
                  <SelectItem value="Сложно">Сложно</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Фото блюда</Label>
            <Input
              type="file"
              accept="image/*"
              required
              placeholder="Загрузите фото блюда"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Ингредиенты
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить ингредиент
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Ингредиент ${index + 1}`}
                required
              />
              {ingredients.length > 1 && (
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
            <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить шаг
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium mt-2">
                {index + 1}
              </div>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={instruction}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  placeholder={`Шаг ${index + 1}`}
                  required
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(index, e.target.files[0])}
                    className="w-full"
                    placeholder="Загрузите фото для шага"
                  />
                  {stepPhotos[index] && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhoto(index)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      Удалить фото
                    </Button>
                  )}
                </div>
                {stepPhotos[index] && (
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(stepPhotos[index])}
                      alt={`Фото шага ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
              {instructions.length > 1 && (
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