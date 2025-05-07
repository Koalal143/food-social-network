"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Container from "@/components/layout/Container";
import AuthService from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await AuthService.login(emailOrUsername, password);
            toast({
                title: "Успешно!",
                description: "Вы успешно вошли в систему",
            });
            router.push("/");
        } catch (error) {
            toast({
                title: "Ошибка",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-8 h-screen flex items-center justify-center">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Вход в аккаунт</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="emailOrUsername">Email или имя пользователя</Label>
                        <Input
                            id="emailOrUsername"
                            value={emailOrUsername}
                            onChange={(e) => setEmailOrUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Вход..." : "Войти"}
                    </Button>
                </form>
            </div>
        </Container>
    );
}