"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Container from "@/components/layout/Container";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandler";

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(identifier, password);
            
            toast({
                title: "Успешный вход",
                description: "Добро пожаловать назад!",
            });
            router.push("/");
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка",
                description: message
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="h-screen flex items-center justify-center overflow-hidden">
            <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-lg">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Вход</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="identifier" className="text-sm font-medium">
                            Email или юзернейм
                        </label>
                        <Input
                            id="identifier"
                            type="text"
                            placeholder="Введите email или юзернейм"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">
                            Пароль
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Вход...' : 'Войти'}
                    </Button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Нет аккаунта?{' '}
                    <Link href="/registration" className="text-primary hover:underline">
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
        </Container>
    );
}