import { useState, useEffect } from "react";
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
  Filter, 
  X, 
  Clock, 
  ChefHat, 
  Tag, 
  Plus, 
  Minus,
  Check,
  RotateCcw
} from "lucide-react";

export default function SearchFilters({ filters, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    includeIngredients: filters.includeIngredients || [],
    excludeIngredients: filters.excludeIngredients || [],
    tags: filters.tags || [],
    cookTimeFrom: filters.cookTimeFrom || '',
    cookTimeTo: filters.cookTimeTo || '',
    sortBy: filters.sortBy || ''
  });

  // Подсчет активных фильтров
  const activeFiltersCount = Object.values(localFilters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + (value.length > 0 ? 1 : 0);
    }
    return count + (value ? 1 : 0);
  }, 0);

  const handleApplyFilters = () => {
    onChange({
      includeIngredients: localFilters.includeIngredients,
      excludeIngredients: localFilters.excludeIngredients,
      tags: localFilters.tags,
      cookTimeFrom: localFilters.cookTimeFrom ? parseInt(localFilters.cookTimeFrom, 10) : null,
      cookTimeTo: localFilters.cookTimeTo ? parseInt(localFilters.cookTimeTo, 10) : null,
      sortBy: localFilters.sortBy,
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters = {
      includeIngredients: [],
      excludeIngredients: [],
      tags: [],
      cookTimeFrom: '',
      cookTimeTo: '',
      sortBy: ''
    };
    setLocalFilters(resetFilters);
    onChange({
      includeIngredients: [],
      excludeIngredients: [],
      tags: [],
      cookTimeFrom: null,
      cookTimeTo: null,
      sortBy: '',
    });
  };

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

  const IngredientInput = ({ type, placeholder, icon: Icon }) => {
    const [inputValue, setInputValue] = useState('');
    
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        addIngredient(type, inputValue);
        setInputValue('');
      }
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Icon className="w-4 h-4" />
          {placeholder}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Добавить ингредиент..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              addIngredient(type, inputValue);
              setInputValue('');
            }}
            disabled={!inputValue.trim()}
            className="px-3"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {localFilters[type].length > 0 && (
          <div className="flex flex-wrap gap-2">
            {localFilters[type].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(type, index)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Закрытие по клику вне окна
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.filter-modal')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* Кнопка открытия фильтров */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="flex items-center gap-2 relative"
        >
          <Filter className="w-4 h-4" />
          Фильтры
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button
            onClick={handleReset}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Сбросить
          </Button>
        )}
      </div>

      {/* Всплывающее окно с фильтрами */}
      {isOpen && (
        <div className="fixed inset-0 h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="filter-modal bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Фильтры поиска</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Содержимое */}
            <div className="p-6 space-y-8 overflow-y-auto max-h-[60vh]">
              {/* Включить ингредиенты */}
              <IngredientInput
                type="includeIngredients"
                placeholder="Обязательные ингредиенты"
                icon={Plus}
              />

              {/* Исключить ингредиенты */}
              <IngredientInput
                type="excludeIngredients"
                placeholder="Исключить ингредиенты"
                icon={Minus}
              />

              {/* Теги */}
              <IngredientInput
                type="tags"
                placeholder="Теги блюд"
                icon={Tag}
              />

              {/* Время приготовления */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4" />
                  Время приготовления (минуты)
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">От</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={localFilters.cookTimeFrom}
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        cookTimeFrom: e.target.value
                      }))}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">До</label>
                    <Input
                      type="number"
                      placeholder="∞"
                      value={localFilters.cookTimeTo}
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        cookTimeTo: e.target.value
                      }))}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Сортировка */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ChefHat className="w-4 h-4" />
                  Сортировать по
                </div>
                <Select
                  onValueChange={(value) => setLocalFilters(prev => ({
                    ...prev,
                    sortBy: value
                  }))}
                  value={localFilters.sortBy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите сортировку" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-created_at">Сначала новые</SelectItem>
                    <SelectItem value="created_at">Сначала старые</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={handleReset}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Сбросить все
              </Button>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="w-4 h-4" />
                  Применить фильтры
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// import { useState } from "react";
// import { Input } from "../input";
// import {
//     Select,
//     SelectTrigger,
//     SelectContent,
//     SelectItem,
//     SelectValue
// } from "../select";
// import { Button } from "../button";

// export default function SearchFilters({ filters, onChange }) {
//     const [includeIngredients, setIncludeIngredients] = useState(filters.includeIngredients || []);
//     const [excludeIngredients, setExcludeIngredients] = useState(filters.excludeIngredients || []);
//     const [tags, setTags] = useState(filters.tags || []);
//     const [cookTimeFrom, setCookTimeFrom] = useState(filters.cookTimeFrom || '');
//     const [cookTimeTo, setCookTimeTo] = useState(filters.cookTimeTo || '');
//     const [sortBy, setSortBy] = useState(filters.sortBy || '');

//     const handleApplyFilters = () => {
//         onChange({
//             includeIngredients,
//             excludeIngredients,
//             tags,
//             cookTimeFrom: cookTimeFrom ? parseInt(cookTimeFrom, 10) : null,
//             cookTimeTo: cookTimeTo ? parseInt(cookTimeTo, 10) : null,
//             sortBy,
//         });
//     };

//     return (
//         <div className="flex flex-wrap gap-4 mb-6">
//             <Input
//                 type="text"
//                 placeholder="Ингредиенты для включения (через запятую)"
//                 value={includeIngredients.join(",")}
//                 onChange={e => setIncludeIngredients(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
//             />
//             <Input
//                 type="text"
//                 placeholder="Ингредиенты для исключения (через запятую)"
//                 value={excludeIngredients.join(",")}
//                 onChange={e => setExcludeIngredients(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
//             />
//             <Input
//                 type="text"
//                 placeholder="Теги (через запятую)"
//                 value={tags.join(",")}
//                 onChange={e => setTags(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
//             />
//             <Input
//                 type="number"
//                 placeholder="Время приготовления от (мин)"
//                 value={cookTimeFrom}
//                 onChange={e => setCookTimeFrom(e.target.value)}
//             />
//             <Input
//                 type="number"
//                 placeholder="Время приготовления до (мин)"
//                 value={cookTimeTo}
//                 onChange={e => setCookTimeTo(e.target.value)}
//             />
//             <Select onValueChange={setSortBy} value={sortBy}>
//                 <SelectTrigger>
//                     <SelectValue placeholder="Сначала" />
//                 </SelectTrigger>
//                 <SelectContent>
//                     <SelectItem value="-created_at">Недавние</SelectItem>
//                     <SelectItem value="created">Старые</SelectItem>
//                 </SelectContent>
//             </Select>
//             <Button onClick={handleApplyFilters}>Применить фильтры</Button>
//         </div>
//     );
// }
