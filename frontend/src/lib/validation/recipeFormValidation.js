import { ValidationRules } from "@/components/ui/ValidatedInput";
import { createValidationRule } from './validationUtils';
import {
    validateRecipeTitle,
    validateRecipeDescription,
    validateCookTime,
    validateIngredientName,
    validateIngredientQuantity,
    validateInstructionDescription,
    validateImageFile,
} from './recipe.validation';

/**
 * Правила валидации для полей рецепта
 * Используют кастомные функции валидации, которые уже включают проверку на обязательность
 */
export const RecipeValidationRules = {
    title: [createValidationRule(validateRecipeTitle)],
    short_description: [createValidationRule(validateRecipeDescription)],
    cook_time_minutes: [createValidationRule(validateCookTime)],
    ingredientName: [createValidationRule(validateIngredientName)],
    ingredientQuantity: [createValidationRule(validateIngredientQuantity)],
    instructionDescription: [createValidationRule(validateInstructionDescription)],
    imageFile: [createValidationRule(validateImageFile)],
    difficulty: [ValidationRules.required("Сложность обязательна для выбора")],
};
