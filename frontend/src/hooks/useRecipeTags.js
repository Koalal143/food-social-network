import { useState } from 'react';
import { validateTag, validateTags } from '@/lib/validation/recipe.validation';
import { TAGS_MAX_COUNT } from '@/constants/validation';

/**
 * Хук для управления тегами рецепта
 * Унифицирует логику работы с тегами между AddRecipeForm и EditRecipeForm
 */
export const useRecipeTags = (initialTags = []) => {
    const [tags, setTags] = useState(initialTags);
    const [tagInput, setTagInput] = useState('');
    const [tagError, setTagError] = useState('');

    /**
     * Добавить новый тег
     */
    const addTag = () => {
        const newTag = tagInput.trim();
        
        // Очистить предыдущие ошибки
        setTagError('');
        
        if (!newTag) {
            return;
        }

        // Проверить лимит тегов
        if (tags.length >= TAGS_MAX_COUNT) {
            setTagError(`Максимум ${TAGS_MAX_COUNT} тегов`);
            return;
        }

        // Валидация тега
        const validationResult = validateTag(newTag, tags);
        if (validationResult !== true) {
            setTagError(validationResult);
            return;
        }

        // Добавить тег
        setTags(prevTags => [...prevTags, newTag]);
        setTagInput('');
        setTagError('');
    };

    /**
     * Удалить тег по индексу
     */
    const removeTag = (index) => {
        setTags(prevTags => prevTags.filter((_, i) => i !== index));
        setTagError('');
    };

    /**
     * Обработчик нажатия Enter в поле ввода тега
     */
    const handleTagInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    /**
     * Валидация всех тегов (для использования при отправке формы)
     */
    const validateAllTags = () => {
        const validationResult = validateTags(tags);
        if (validationResult !== true) {
            setTagError(validationResult);
            return false;
        }
        setTagError('');
        return true;
    };

    /**
     * Очистить ошибку тегов
     */
    const clearTagError = () => {
        setTagError('');
    };

    /**
     * Установить теги (для инициализации в EditRecipeForm)
     */
    const setTagsFromExternal = (newTags) => {
        setTags(newTags || []);
        setTagError('');
    };

    return {
        // Состояние
        tags,
        tagInput,
        tagError,
        
        // Действия
        addTag,
        removeTag,
        setTagInput,
        handleTagInputKeyPress,
        validateAllTags,
        clearTagError,
        setTagsFromExternal,
        
        // Вспомогательные данные
        canAddMoreTags: tags.length < TAGS_MAX_COUNT,
        tagsCount: tags.length,
        maxTagsCount: TAGS_MAX_COUNT,
    };
};
