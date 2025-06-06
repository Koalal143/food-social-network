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
  RotateCcw,
  Search
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

  const handleApplyFilters = () => {
    const filtersToApply = {
      include_ingredients: localFilters.include_ingredients,
      exclude_ingredients: localFilters.exclude_ingredients,
      tags: localFilters.tags,
      cook_time_from: localFilters.cook_time_from ? parseInt(localFilters.cook_time_from, 10) : null,
      cook_time_to: localFilters.cook_time_to ? parseInt(localFilters.cook_time_to, 10) : null,
      sort_by: localFilters.sort_by,
    };
    
    // Применяем фильтры немедленно
    onChange(filtersToApply);
    setIsOpen(false);
  };

  const handleReset = () => {
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
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Icon className="w-4 h-4" />
          {placeholder}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Введите и нажмите Enter..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 text-sm"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              addIngredient(type, inputValue);
              setInputValue('');
            }}
            disabled={!inputValue.trim()}
            className="px-3 h-10"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {localFilters[type].length > 0 && (
          <div className="flex flex-wrap gap-2">
            {localFilters[type].map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border transition-colors ${colorClasses[color]}`}
              >
                <span className="font-medium">{item}</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(type, index)}
                  className="ml-1 hover:bg-white hover:bg-opacity-50 rounded-full p-0.5 transition-colors"
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

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Блокировка скролла при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Кнопка открытия фильтров */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="flex items-center gap-2 relative hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Фильтры</span>
          <span className="sm:hidden">Фильтры поиска</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Сбросить все
            </Button>
          </div>
        )}
      </div>

      {/* Всплывающее окно с фильтрами */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="filter-modal bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Фильтры поиска</h2>
                  <p className="text-sm text-gray-500">Настройте параметры для точного поиска</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Содержимое */}
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
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
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4" />
                  Время приготовления (минуты)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Минимум</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={localFilters.cook_time_from}
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        cook_time_from: e.target.value
                      }))}
                      min="0"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Максимум</label>
                    <Input
                      type="number"
                      placeholder="Без ограничений"
                      value={localFilters.cook_time_to}
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        cook_time_to: e.target.value
                      }))}
                      min="0"
                      className="text-sm"
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
                    sort_by: value
                  }))}
                  value={localFilters.sort_by}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Выберите порядок сортировки" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-created_at">Сначала новые рецепты</SelectItem>
                    <SelectItem value="created_at">Сначала старые рецепты</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 gap-3 sm:gap-0">
              <Button
                onClick={handleReset}
                variant="ghost"
                className="flex items-center gap-2 order-2 sm:order-1 w-full sm:w-auto"
                disabled={activeFiltersCount === 0}
              >
                <RotateCcw className="w-4 h-4" />
                Сбросить все
              </Button>
              
              <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                >
                  <Check className="w-4 h-4" />
                  Применить
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-500 text-xs px-1.5 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @keyframes fade-in-0 {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoom-in-95 {
          from {
            transform: scale(0.95);
          }
          to {
            transform: scale(1);
          }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in-0 {
          animation-name: fade-in-0;
        }
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
        .duration-200 {
          animation-duration: 200ms;
        }
      `}</style>
    </>
  );
}

// import { useState, useEffect } from "react";
// import { Input } from "../input";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue
// } from "../select";
// import { Button } from "../button";
// import { 
//   Filter, 
//   X, 
//   Clock, 
//   ChefHat, 
//   Tag, 
//   Plus, 
//   Minus,
//   Check,
//   RotateCcw
// } from "lucide-react";

// export default function SearchFilters({ filters, onChange }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [localFilters, setLocalFilters] = useState({
//     include_ingredients: filters.includeIngredients || [],
//     exclude_ingredients: filters.excludeIngredients || [],
//     tags: filters.tags || [],
//     cook_time_from: filters.cookTimeFrom || '',
//     cook_time_to: filters.cookTimeTo || '',
//     sort_by: filters.sortBy || ''
//   });

//   // Подсчет активных фильтров
//   const activeFiltersCount = Object.values(localFilters).reduce((count, value) => {
//     if (Array.isArray(value)) {
//       return count + (value.length > 0 ? 1 : 0);
//     }
//     return count + (value ? 1 : 0);
//   }, 0);

//   const handleApplyFilters = () => {
//     onChange({
//       include_ingredients: localFilters.include_ingredients,
//       exclude_ingredients: localFilters.exclude_ingredients,
//       tags: localFilters.tags,
//       cook_time_from: localFilters.cook_time_from ? parseInt(localFilters.cook_time_from, 10) : null,
//       cook_time_to: localFilters.cook_time_to ? parseInt(localFilters.cook_time_to, 10) : null,
//       sort_by: localFilters.sort_by,
//     });
//     setIsOpen(false);
//   };

//   const handleReset = () => {
//     const resetFilters = {
//       include_ingredients: [],
//       exclude_ingredients: [],
//       tags: [],
//       cook_time_from: '',
//       cook_time_to: '',
//       sort_by: ''
//     };
//     setLocalFilters(resetFilters);
//     onChange({
//       include_ingredients: [],
//       exclude_ingredients: [],
//       tags: [],
//       cook_time_from: null,
//       cook_time_to: null,
//       sort_by: '',
//     });
//   };

//   const addIngredient = (type, value) => {
//     if (value.trim()) {
//       setLocalFilters(prev => ({
//         ...prev,
//         [type]: [...prev[type], value.trim()]
//       }));
//     }
//   };

//   const removeIngredient = (type, index) => {
//     setLocalFilters(prev => ({
//       ...prev,
//       [type]: prev[type].filter((_, i) => i !== index)
//     }));
//   };

//   const IngredientInput = ({ type, placeholder, icon: Icon }) => {
//     const [inputValue, setInputValue] = useState('');
    
//     const handleKeyPress = (e) => {
//       if (e.key === 'Enter' && inputValue.trim()) {
//         addIngredient(type, inputValue);
//         setInputValue('');
//       }
//     };

//     return (
//       <div className="space-y-3">
//         <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//           <Icon className="w-4 h-4" />
//           {placeholder}
//         </div>
//         <div className="flex gap-2">
//           <Input
//             type="text"
//             placeholder="Добавить ингредиент..."
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             onKeyPress={handleKeyPress}
//             className="flex-1"
//           />
//           <Button
//             type="button"
//             size="sm"
//             onClick={() => {
//               addIngredient(type, inputValue);
//               setInputValue('');
//             }}
//             disabled={!inputValue.trim()}
//             className="px-3"
//           >
//             <Plus className="w-4 h-4" />
//           </Button>
//         </div>
//         {localFilters[type].length > 0 && (
//           <div className="flex flex-wrap gap-2">
//             {localFilters[type].map((item, index) => (
//               <div
//                 key={index}
//                 className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
//               >
//                 <span>{item}</span>
//                 <button
//                   type="button"
//                   onClick={() => removeIngredient(type, index)}
//                   className="hover:bg-blue-200 rounded-full p-0.5"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Закрытие по клику вне окна
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (isOpen && !e.target.closest('.filter-modal')) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [isOpen]);

//   return (
//     <>
//       {/* Кнопка открытия фильтров */}
//       <div className="flex items-center gap-4 mb-6">
//         <Button
//           onClick={() => setIsOpen(true)}
//           variant="outline"
//           className="flex items-center gap-2 relative"
//         >
//           <Filter className="w-4 h-4" />
//           Фильтры
//           {activeFiltersCount > 0 && (
//             <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//               {activeFiltersCount}
//             </span>
//           )}
//         </Button>
        
//         {activeFiltersCount > 0 && (
//           <Button
//             onClick={handleReset}
//             variant="ghost"
//             size="sm"
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <RotateCcw className="w-4 h-4 mr-1" />
//             Сбросить
//           </Button>
//         )}
//       </div>

//       {/* Всплывающее окно с фильтрами */}
//       {isOpen && (
//         <div className="fixed inset-0 h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="filter-modal bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
//             {/* Заголовок */}
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <div className="flex items-center gap-2">
//                 <Filter className="w-5 h-5 text-blue-600" />
//                 <h2 className="text-xl font-semibold text-gray-900">Фильтры поиска</h2>
//               </div>
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Содержимое */}
//             <div className="p-6 space-y-8 overflow-y-auto max-h-[60vh]">
//               {/* Включить ингредиенты */}
//               <IngredientInput
//                 type="include_ingredients"
//                 placeholder="Обязательные ингредиенты"
//                 icon={Plus}
//               />

//               {/* Исключить ингредиенты */}
//               <IngredientInput
//                 type="exclude_ingredients"
//                 placeholder="Исключить ингредиенты"
//                 icon={Minus}
//               />

//               {/* Теги */}
//               <IngredientInput
//                 type="tags"
//                 placeholder="Теги блюд"
//                 icon={Tag}
//               />

//               {/* Время приготовления */}
//               <div className="space-y-3">
//                 <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                   <Clock className="w-4 h-4" />
//                   Время приготовления (минуты)
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs text-gray-500 mb-1">От</label>
//                     <Input
//                       type="number"
//                       placeholder="0"
//                       value={localFilters.cook_time_from}
//                       onChange={(e) => setLocalFilters(prev => ({
//                         ...prev,
//                         cookTimeFrom: e.target.value
//                       }))}
//                       min="0"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs text-gray-500 mb-1">До</label>
//                     <Input
//                       type="number"
//                       placeholder="∞"
//                       value={localFilters.cook_time_to}
//                       onChange={(e) => setLocalFilters(prev => ({
//                         ...prev,
//                         cookTimeTo: e.target.value
//                       }))}
//                       min="0"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Сортировка */}
//               <div className="space-y-3">
//                 <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                   <ChefHat className="w-4 h-4" />
//                   Сортировать по
//                 </div>
//                 <Select
//                   onValueChange={(value) => setLocalFilters(prev => ({
//                     ...prev,
//                     sortBy: value
//                   }))}
//                   value={localFilters.sort_by}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Выберите сортировку" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="-created_at">Сначала новые</SelectItem>
//                     <SelectItem value="created_at">Сначала старые</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Кнопки действий */}
//             <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
//               <Button
//                 onClick={handleReset}
//                 variant="ghost"
//                 className="flex items-center gap-2"
//               >
//                 <RotateCcw className="w-4 h-4" />
//                 Сбросить все
//               </Button>
              
//               <div className="flex gap-3">
//                 <Button
//                   onClick={() => setIsOpen(false)}
//                   variant="outline"
//                 >
//                   Отмена
//                 </Button>
//                 <Button
//                   onClick={handleApplyFilters}
//                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
//                 >
//                   <Check className="w-4 h-4" />
//                   Применить фильтры
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// // import { useState } from "react";
// // import { Input } from "../input";
// // import {
// //     Select,
// //     SelectTrigger,
// //     SelectContent,
// //     SelectItem,
// //     SelectValue
// // } from "../select";
// // import { Button } from "../button";

// // export default function SearchFilters({ filters, onChange }) {
// //     const [includeIngredients, setIncludeIngredients] = useState(filters.includeIngredients || []);
// //     const [excludeIngredients, setExcludeIngredients] = useState(filters.excludeIngredients || []);
// //     const [tags, setTags] = useState(filters.tags || []);
// //     const [cookTimeFrom, setCookTimeFrom] = useState(filters.cookTimeFrom || '');
// //     const [cookTimeTo, setCookTimeTo] = useState(filters.cookTimeTo || '');
// //     const [sortBy, setSortBy] = useState(filters.sortBy || '');

// //     const handleApplyFilters = () => {
// //         onChange({
// //             includeIngredients,
// //             excludeIngredients,
// //             tags,
// //             cookTimeFrom: cookTimeFrom ? parseInt(cookTimeFrom, 10) : null,
// //             cookTimeTo: cookTimeTo ? parseInt(cookTimeTo, 10) : null,
// //             sortBy,
// //         });
// //     };

// //     return (
// //         <div className="flex flex-wrap gap-4 mb-6">
// //             <Input
// //                 type="text"
// //                 placeholder="Ингредиенты для включения (через запятую)"
// //                 value={includeIngredients.join(",")}
// //                 onChange={e => setIncludeIngredients(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
// //             />
// //             <Input
// //                 type="text"
// //                 placeholder="Ингредиенты для исключения (через запятую)"
// //                 value={excludeIngredients.join(",")}
// //                 onChange={e => setExcludeIngredients(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
// //             />
// //             <Input
// //                 type="text"
// //                 placeholder="Теги (через запятую)"
// //                 value={tags.join(",")}
// //                 onChange={e => setTags(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
// //             />
// //             <Input
// //                 type="number"
// //                 placeholder="Время приготовления от (мин)"
// //                 value={cookTimeFrom}
// //                 onChange={e => setCookTimeFrom(e.target.value)}
// //             />
// //             <Input
// //                 type="number"
// //                 placeholder="Время приготовления до (мин)"
// //                 value={cookTimeTo}
// //                 onChange={e => setCookTimeTo(e.target.value)}
// //             />
// //             <Select onValueChange={setSortBy} value={sortBy}>
// //                 <SelectTrigger>
// //                     <SelectValue placeholder="Сначала" />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                     <SelectItem value="-created_at">Недавние</SelectItem>
// //                     <SelectItem value="created">Старые</SelectItem>
// //                 </SelectContent>
// //             </Select>
// //             <Button onClick={handleApplyFilters}>Применить фильтры</Button>
// //         </div>
// //     );
// // }
