import { useState, useEffect, useCallback } from "react";
import { Input } from "../input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "../select";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import {
  Filter,
  X,
  Clock,
  ChefHat,
  Tag,
  Plus,
  Minus,
  Check,
  RotateCcw,
} from "lucide-react";

export default function SearchFilters({ filters, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    include_ingredients: filters.include_ingredients || [],
    exclude_ingredients: filters.exclude_ingredients || [],
    tags: filters.tags || [],
    cook_time_from: filters.cook_time_from || '',
    cook_time_to: filters.cook_time_to || '',
    sort_by: filters.sort_by || ''
  });



  // Синхронизация с внешними фильтрами
  useEffect(() => {
    setLocalFilters({
      include_ingredients: filters.include_ingredients || [],
      exclude_ingredients: filters.exclude_ingredients || [],
      tags: filters.tags || [],
      cook_time_from: filters.cook_time_from || '',
      cook_time_to: filters.cook_time_to || '',
      sort_by: filters.sort_by || ''
    });
  }, [filters]);

  // Подсчет активных фильтров
  const activeFiltersCount = Object.values(localFilters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + (value.length > 0 ? 1 : 0);
    }
    return count + (value ? 1 : 0);
  }, 0);

  const handleApplyFilters = useCallback(() => {
    const filtersToApply = {
      include_ingredients: localFilters.include_ingredients,
      exclude_ingredients: localFilters.exclude_ingredients,
      tags: localFilters.tags,
      cook_time_from: localFilters.cook_time_from ? parseInt(localFilters.cook_time_from, 10) : null,
      cook_time_to: localFilters.cook_time_to ? parseInt(localFilters.cook_time_to, 10) : null,
      sort_by: localFilters.sort_by,
    };

    // Применяем фильтры
    onChange(filtersToApply);
    setIsOpen(false);
  }, [localFilters, onChange]);

  const handleReset = useCallback(() => {
    const resetFilters = {
      include_ingredients: [],
      exclude_ingredients: [],
      tags: [],
      cook_time_from: '',
      cook_time_to: '',
      sort_by: ''
    };
    setLocalFilters(resetFilters);

    // Применяем сброс немедленно
    onChange({
      include_ingredients: [],
      exclude_ingredients: [],
      tags: [],
      cook_time_from: null,
      cook_time_to: null,
      sort_by: '',
    });
  }, [onChange]);

  const addIngredient = (type, value) => {
    if (value.trim()) {
      setLocalFilters(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
    }
  };

  const removeIngredient = (type, index) => {
    setLocalFilters(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const IngredientInput = ({ type, placeholder, icon: Icon, color = "blue" }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        addIngredient(type, inputValue);
        setInputValue('');
      }
    };

    const colorClasses = {
      blue: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      red: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
      green: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <Icon className="w-3.5 h-3.5" />
          {placeholder}
        </div>
        <div className="flex gap-1.5">
          <Input
            type="text"
            placeholder="Введите и нажмите Enter..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 text-sm h-7"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              addIngredient(type, inputValue);
              setInputValue('');
            }}
            disabled={!inputValue.trim()}
            className="px-1.5 h-7"
            variant="outline"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        {localFilters[type].length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {localFilters[type].map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border transition-colors ${colorClasses[color]}`}
              >
                <span className="font-medium">{item}</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(type, index)}
                  className="hover:bg-white hover:bg-opacity-50 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };



  return (
    <>
      {/* Кнопка открытия фильтров */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 px-2 sm:px-0">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 relative hover:bg-gray-50 transition-colors h-9 px-3 text-sm"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Фильтры</span>
              <span className="sm:hidden">Фильтры поиска</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            className="w-80 sm:w-96 max-w-[calc(100vw-2rem)] p-0 z-[200]"
            sideOffset={6}
          >
            {/* Заголовок */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-50 rounded-md">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Фильтры</h2>
                  <p className="text-xs text-gray-500">Настройте поиск</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Содержимое */}
            <div className="px-3 py-3 space-y-3.5 overflow-y-auto max-h-[55vh] custom-scrollbar">
              {/* Включить ингредиенты */}
              <IngredientInput
                type="include_ingredients"
                placeholder="Обязательные ингредиенты"
                icon={Plus}
                color="blue"
              />

              {/* Исключить ингредиенты */}
              <IngredientInput
                type="exclude_ingredients"
                placeholder="Исключить ингредиенты"
                icon={Minus}
                color="red"
              />

              {/* Теги */}
              <IngredientInput
                type="tags"
                placeholder="Теги блюд"
                icon={Tag}
                color="green"
              />

              {/* Время приготовления */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Clock className="w-3.5 h-3.5" />
                  Время приготовления (мин)
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-medium">От</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={localFilters.cook_time_from}
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        cook_time_from: e.target.value
                      }))}
                      min="0"
                      className="text-sm h-7"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-medium">До</label>
                    <Input
                      type="number"
                      placeholder="∞"
                      value={localFilters.cook_time_to}
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        cook_time_to: e.target.value
                      }))}
                      min="0"
                      className="text-sm h-7"
                    />
                  </div>
                </div>
              </div>

              {/* Сортировка */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <ChefHat className="w-3.5 h-3.5" />
                  Сортировка
                </div>
                <Select
                  onValueChange={(value) => setLocalFilters(prev => ({
                    ...prev,
                    sort_by: value
                  }))}
                  value={localFilters.sort_by}
                >
                  <SelectTrigger className="text-sm h-7">
                    <SelectValue placeholder="Выберите порядок" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-created_at">Сначала новые</SelectItem>
                    <SelectItem value="created_at">Сначала старые</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center justify-between px-2.5 py-2 border-t border-gray-100 bg-gray-50">
              {/* Кнопка "Сбросить" - только на десктопе */}
              <Button
                onClick={handleReset}
                variant="ghost"
                className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-gray-800 text-xs px-2 h-6"
                disabled={activeFiltersCount === 0}
                size="sm"
              >
                <RotateCcw className="w-3 h-3" />
                Сбросить
                {activeFiltersCount > 0 && (
                  <span className="bg-gray-200 text-gray-700 text-xs px-1 py-0.5 rounded-full ml-1 min-w-[14px] text-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {/* Пустой div для выравнивания на мобильных */}
              <div className="sm:hidden"></div>

              {/* Кнопки "Отмена" и "Применить" */}
              <div className="flex gap-1.5 w-full sm:w-auto">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  size="sm"
                  className="px-2 text-xs h-6 flex-1 sm:flex-none"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-2 text-xs h-6 flex-1 sm:flex-none justify-center"
                  size="sm"
                >
                  <Check className="w-3 h-3" />
                  Применить
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded-full ml-1 min-w-[14px] text-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>


        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 px-2 sm:px-0">
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 text-xs h-6 px-2 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Сбросить все
              <span className="bg-gray-200 text-gray-700 text-xs px-1 py-0.5 rounded-full ml-1 min-w-[14px] text-center">
                {activeFiltersCount}
              </span>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}