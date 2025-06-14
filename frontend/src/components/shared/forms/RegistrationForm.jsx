"use client"

import { useEnhancedToast } from "@/hooks/useEnhancedToast";
import { handleApiError } from "@/utils/errorHandler";
import { registrationSchema } from "@/lib/schemas/auth.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../ui/button";
import ValidatedInput from "../../ui/ValidatedInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthValidationRules, createConfirmPasswordRules } from "@/lib/validation/formValidation";

export default function RegistrationForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false); // Отслеживаем попытку отправки формы
    const { register } = useAuth();
    const router = useRouter();
    const enhancedToast = useEnhancedToast();

    const form = useForm({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        },
    });
    
    const onSubmit = async (data) => {
    setIsSubmitted(true); // Отмечаем, что форма была отправлена
    setIsLoading(true);
    try {
        await register(data.username, data.email, data.password);
        router.push("/");
    } catch (error) {
        const { message, type } = handleApiError(error);
        enhancedToast.error(
            "Ошибка регистрации",
            message
        );
    } finally {
        setIsLoading(false);
    }
    };

    return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 sm:space-y-3">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium text-sm">Юзернейм</FormLabel>
                  <FormControl>
                    <ValidatedInput
                      placeholder="Введите юзернейм"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      showErrors={isSubmitted}
                      validationRules={AuthValidationRules.username}
                      className="bg-white/60 border-white/40 text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-white/60 transition-all backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium text-sm">Email</FormLabel>
                  <FormControl>
                    <ValidatedInput
                      type="email"
                      placeholder="Введите email"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      showErrors={isSubmitted}
                      validationRules={AuthValidationRules.email}
                      className="bg-white/60 border-white/40 text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-white/60 transition-all backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium text-sm">Пароль</FormLabel>
                  <FormControl>
                    <ValidatedInput
                      type={showPassword ? "text" : "password"}
                      placeholder="Введите пароль"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      showErrors={isSubmitted}
                      validationRules={AuthValidationRules.password}
                      className="bg-white/60 border-white/40 text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-white/60 transition-all backdrop-blur-sm"
                      rightElement={
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      }
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium text-sm">Подтверждение пароля</FormLabel>
                  <FormControl>
                    <ValidatedInput
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Повторите пароль"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      showErrors={isSubmitted}
                      validationRules={createConfirmPasswordRules(form.watch("password"))}
                      className="bg-white/60 border-white/40 text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-white/60 transition-all backdrop-blur-sm"
                      rightElement={
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full mt-4"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </form>
        </Form>
    )
}