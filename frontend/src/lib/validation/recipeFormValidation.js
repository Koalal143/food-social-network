import { ValidationRules } from "@/components/ui/ValidatedInput";
import {
    validateRecipeTitle,
    validateRecipeDescription,
    validateCookTime,
    validateIngredientName,
    validateIngredientQuantity,
    validateInstructionDescription,
    validateImageFile,
} from './recipe.validation';

export const RecipeValidationRules = {
    title: [
        ValidationRules.required("Название рецепта обязательно для заполнения"),
        {
            validate: async (value) => {
                const result = validateRecipeTitle(value);
                return {
                    isValid: result === true,
                    message: result === true ? '' : result,
                    severity: 'error'
                };
            }
        }
    ],

    short_description: [
        ValidationRules.required("Описание рецепта обязательно для заполнения"),
        {
            validate: async (value) => {
                const result = validateRecipeDescription(value);
                return {
                    isValid: result === true,
                    message: result === true ? '' : result,
                    severity: 'error'
                };
            }
        }
    ],

    cook_time_minutes: [
        ValidationRules.required("Время приготовления обязательно для заполнения"),
        {
            validate: async (value) => {
                const result = validateCookTime(value);
                return {
                    isValid: result === true,
                    message: result === true ? '' : result,
                    severity: 'error'
                };
            }
        }
    ],

    ingredientName: [
        ValidationRules.required("Название ингредиента обязательно"),
        {
            validate: async (value) => {
                const result = validateIngredientName(value);
                return {
                    isValid: result === true,
                    message: result === true ? '' : result,
                    severity: 'error'
                };
            }
        }
    ],

    ingredientQuantity: [
        ValidationRules.required("Количество ингредиента обязательно"),
        {
            validate: async (value) => {
                const result = validateIngredientQuantity(value);
                return {
                    isValid: result === true,
                    message: result === true ? '' : result,
                    severity: 'error'
                };
            }
        }
    ],

    instructionDescription: [
        ValidationRules.required("Описание шага обязательно"),
        {
            validate: async (value) => {
                const result = validateInstructionDescription(value);
                return {
                    isValid: result === true,
                    message: result === true ? '' : result,
                    severity: 'error'
                };
            }
        }
    ],

    imageFile: [
        {
            validate: async (file) => {
                const result = validateImageFile(file);
                return {
                    isValid: result === true,
                    message: result === true ? '' : result,
                    severity: 'error'
                };
            }
        }
    ],
};
