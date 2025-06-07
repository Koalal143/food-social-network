/**
 * Централизованная система валидации для форм
 * Интегрирует Zod схемы с ValidatedInput компонентом
 */

import { useState } from "react";
import { ValidationRules } from "@/components/ui/ValidatedInput";
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_REGEX,
  isBannedUsername
} from "@/constants/validation";

/**
 * Правила валидации для полей аутентификации
 * Основаны на Zod схемах из auth.schema.js
 */
export const AuthValidationRules = {
  // Правила для поля identifier (email или username) в форме входа
  identifier: [
    ValidationRules.required("Введите email или юзернейм"),
    ValidationRules.minLength(3, "Введите email или юзернейм")
  ],

  // Правила для username в форме регистрации
  username: [
    ValidationRules.required("Юзернейм обязателен для заполнения"),
    ValidationRules.minLength(USERNAME_MIN_LENGTH, "Юзернейм должен содержать минимум 3 символа"),
    ValidationRules.maxLength(USERNAME_MAX_LENGTH, "Юзернейм не должен превышать 30 символов"),
    {
      validate: async (value) => {
        if (!value) return { isValid: true };
        return {
          isValid: USERNAME_REGEX.test(value),
          message: "Юзернейм может содержать только латинские буквы, цифры, дефис и нижнее подчеркивание",
          severity: 'error'
        };
      }
    },
    {
      validate: async (value) => {
        if (!value) return { isValid: true };
        return {
          isValid: !isBannedUsername(value),
          message: "Данное имя пользователя запрещено",
          severity: 'error'
        };
      }
    }
  ],

  // Правила для email в форме регистрации
  email: [
    ValidationRules.required("Email обязателен для заполнения"),
    ValidationRules.email("Введите корректный email")
  ],

  // Правила для пароля (используются в обеих формах)
  password: [
    ValidationRules.required("Пароль обязателен для заполнения"),
    ValidationRules.minLength(PASSWORD_MIN_LENGTH, `Пароль должен содержать минимум ${PASSWORD_MIN_LENGTH} символов`),
    {
      validate: async (value) => {
        if (!value) return { isValid: true };
        return {
          isValid: /[A-ZА-Я]/.test(value),
          message: "Пароль должен содержать хотя бы одну заглавную букву",
          severity: 'error'
        };
      }
    },
    {
      validate: async (value) => {
        if (!value) return { isValid: true };
        return {
          isValid: /[a-zа-я]/.test(value),
          message: "Пароль должен содержать хотя бы одну строчную букву",
          severity: 'error'
        };
      }
    },
    {
      validate: async (value) => {
        if (!value) return { isValid: true };
        return {
          isValid: /[0-9]/.test(value),
          message: "Пароль должен содержать хотя бы одну цифру",
          severity: 'error'
        };
      }
    },
    {
      validate: async (value) => {
        if (!value) return { isValid: true };
        return {
          isValid: /[!@#$%^&*(),.?":{}|<>]/.test(value),
          message: "Пароль должен содержать хотя бы один специальный символ",
          severity: 'error'
        };
      }
    }
  ],

  // Правила для подтверждения пароля (используется в форме регистрации)
  confirmPassword: [
    ValidationRules.required("Подтверждение пароля обязательно")
  ]
};

/**
 * Утилита для создания правила валидации подтверждения пароля
 * @param {string} passwordValue - значение основного пароля
 * @returns {Array} правила валидации для подтверждения пароля
 */
export const createConfirmPasswordRules = (passwordValue) => [
  ...AuthValidationRules.confirmPassword,
  {
    validate: async (value) => {
      if (!value) return { isValid: true };
      return {
        isValid: value === passwordValue,
        message: "Пароли не совпадают",
        severity: 'error'
      };
    }
  }
];

/**
 * Хук для управления состоянием валидации формы
 * @returns {Object} объект с состоянием и методами управления валидацией
 */
export const useFormValidation = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (callback) => {
    return (data) => {
      setIsSubmitted(true);
      return callback(data);
    };
  };

  const resetValidation = () => {
    setIsSubmitted(false);
  };

  return {
    isSubmitted,
    handleSubmit,
    resetValidation
  };
};
