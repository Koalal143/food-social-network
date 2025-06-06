"use client"

import { useState } from "react";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import ValidatedInput from "../../ui/ValidatedInput";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas/auth.schema";
import { handleApiError } from "@/utils/errorHandler";
import { AuthValidationRules } from "@/lib/validation/formValidation";

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false); // Отслеживаем попытку отправки формы
    const { login } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        identifier: "",
        password: "",
      },
    });

    const onSubmit = async (data) => {
        setIsSubmitted(true); // Отмечаем, что форма была отправлена
        setIsLoading(true);
        try {
          await login(data.identifier, data.password);
          router.push("/");
        } catch (error) {
          const { message, type } = handleApiError(error);
          toast({
            variant: type,
            title: "Ошибка",
            description: message,
          });
        } finally {
          setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Email или юзернейм</FormLabel>
                  <FormControl>
                    <ValidatedInput
                      placeholder="Введите email или юзернейм"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      showErrors={isSubmitted}
                      validationRules={AuthValidationRules.identifier}
                      className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white transition-colors"
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
                  <FormLabel className="text-gray-700 font-medium">Пароль</FormLabel>
                  <FormControl>
                    <ValidatedInput
                      type={showPassword ? "text" : "password"}
                      placeholder="Введите пароль"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      showErrors={isSubmitted}
                      validationRules={AuthValidationRules.password}
                      className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white transition-colors"
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </Form>
    )
}