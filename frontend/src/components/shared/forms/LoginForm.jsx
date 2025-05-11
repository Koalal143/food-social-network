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
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas/auth.schema";
import { handleApiError } from "@/utils/errorHandler";

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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
        setIsLoading(true);
        try {
          await login(data.identifier, data.password);
          toast({
            title: "Успешный вход",
            description: "Добро пожаловать!",
          });
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
                    <Input
                      placeholder="Введите email или юзернейм"
                      className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
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
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Введите пароль"
                        className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
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
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-orange-400 hover:bg-orange-500 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </Form>
    )
}