import { useState } from 'react';
import { Button } from './ui/button';

const AddRecipeForm = () => {
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь будет логика отправки данных на сервер
    console.log('Form submitted');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Название рецепта
          </label>
          <input
            type="text"
            required
            className="w-full p-2 border border-border rounded-md bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Описание
          </label>
          <textarea
            required
            rows={3}
            className="w-full p-2 border border-border rounded-md bg-background"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Время приготовления
            </label>
            <input
              type="text"
              required
              placeholder="например: 1 ч 30 мин"
              className="w-full p-2 border border-border rounded-md bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Количество порций
            </label>
            <input
              type="number"
              required
              min="1"
              className="w-full p-2 border border-border rounded-md bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Сложность
            </label>
            <select
              required
              className="w-full p-2 border border-border rounded-md bg-background"
            >
              <option value="Легко">Легко</option>
              <option value="Средне">Средне</option>
              <option value="Сложно">Сложно</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Фото блюда
          </label>
          <input
            type="file"
            accept="image/*"
            required
            className="w-full p-2 border border-border rounded-md bg-background"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              Ингредиенты
            </label>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              Добавить ингредиент
            </Button>
          </div>
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <input
                key={index}
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Ингредиент ${index + 1}`}
                required
                className="w-full p-2 border border-border rounded-md bg-background"
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              Инструкция приготовления
            </label>
            <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
              Добавить шаг
            </Button>
          </div>
          <div className="space-y-2">
            {instructions.map((instruction, index) => (
              <textarea
                key={index}
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                placeholder={`Шаг ${index + 1}`}
                required
                rows={2}
                className="w-full p-2 border border-border rounded-md bg-background"
              />
            ))}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Опубликовать рецепт
      </Button>
    </form>
  );
};

export default AddRecipeForm; 