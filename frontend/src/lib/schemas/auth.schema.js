import { z } from "zod";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_REGEX
} from "@/constants/validation";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, "Введите email или юзернейм"),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Пароль должен содержать минимум ${PASSWORD_MIN_LENGTH} символов`)
    .regex(/[A-ZА-Я]/, "Пароль должен содержать хотя бы одну заглавную букву")
    .regex(/[a-zа-я]/, "Пароль должен содержать хотя бы одну строчную букву")
    .regex(/[0-9]/, "Пароль должен содержать хотя бы одну цифру")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Пароль должен содержать хотя бы один специальный символ, например: * # $ ^ & _"),
});

export const registrationSchema = z
  .object({
    username: z
      .string()
      .min(USERNAME_MIN_LENGTH, "Юзернейм должен содержать минимум 3 символа")
      .max(USERNAME_MAX_LENGTH, "Юзернейм не должен превышать 30 символов")
      .regex(USERNAME_REGEX, "Юзернейм может содержать только латинские буквы, цифры, дефис и ниижнее подчеркивание"),
    email: z
      .string()
      .email("Введите корректный email"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Пароль должен содержать минимум ${PASSWORD_MIN_LENGTH} символов`)
      .regex(/[A-ZА-Я]/, "Пароль должен содержать хотя бы одну заглавную букву")
      .regex(/[a-zа-я]/, "Пароль должен содержать хотя бы одну строчную букву")
      .regex(/[0-9]/, "Пароль должен содержать хотя бы одну цифру")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Пароль должен содержать хотя бы один специальный символ"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  }); 