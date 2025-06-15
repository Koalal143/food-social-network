/**
 * Централизованная система валидации для форм
 * Интегрирует Zod схемы с ValidatedInput компонентом
 */

import { useState } from "react";
import { ValidationRules } from "@/components/ui/ValidatedInput";
import { createValidationRule } from './validationUtils';
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
    createValidationRule((value) => {
      if (!value) return true;
      return USERNAME_REGEX.test(value)
        ? true
        : "Юзернейм может содержать только латинские буквы, цифры, дефис и нижнее подчеркивание";
    }),
    createValidationRule((value) => {
      if (!value) return true;
      return !isBannedUsername(value)
        ? true
        : "Данное имя пользователя запрещено";
    })
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
    createValidationRule((value) => {
      if (!value) return true;
      return /[A-ZА-Я]/.test(value)
        ? true
        : "Пароль должен содержать хотя бы одну заглавную букву";
    }),
    createValidationRule((value) => {
      if (!value) return true;
      return /[a-zа-я]/.test(value)
        ? true
        : "Пароль должен содержать хотя бы одну строчную букву";
    }),
    createValidationRule((value) => {
      if (!value) return true;
      return /[0-9]/.test(value)
        ? true
        : "Пароль должен содержать хотя бы одну цифру";
    }),
    createValidationRule((value) => {
      if (!value) return true;
      return /[!@#$%^&*(),.?":{}|<>]/.test(value)
        ? true
        : "Пароль должен содержать хотя бы один специальный символ";
    })
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
  createValidationRule((value) => {
    if (!value) return true;
    return value === passwordValue
      ? true
      : "Пароли не совпадают";
  })
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
