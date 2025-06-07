"use client"

import { useToast } from "@/hooks/use-toast";
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
import { Input } from "../../ui/input";
import ValidatedInput, { ValidationRules } from "../../ui/ValidatedInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegistrationForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
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
    setIsLoading(true);
    try {
        await register(data.username, data.email, data.password);
        enhancedToast.success(
            "Успешная регистрация",
            "Добро пожаловать в наше сообщество!"
        );
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Юзернейм</FormLabel>
                  <FormControl>
                    <ValidatedInput
                      placeholder="Введите юзернейм"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      validationRules={[
                        ValidationRules.required(),
                        ValidationRules.minLength(3, "Минимум 3 символа"),
                        ValidationRules.maxLength(20, "Максимум 20 символов")
                      ]}
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <ValidatedInput
                      type="email"
                      placeholder="Введите email"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      validationRules={[
                        ValidationRules.required(),
                        ValidationRules.email()
                      ]}
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
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Введите пароль"
                        className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white transition-colors pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription>
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
                  <FormLabel>Подтверждение пароля</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Повторите пароль"
                        className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white transition-colors pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </form>
        </Form>
    )
}