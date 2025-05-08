"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Container from '@/components/layout/Container'
import { useToast } from '@/hooks/use-toast'

export default function RegistrationPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    
    const { register } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await register(username, email, password)
            toast({
                title: "Успешная регистрация",
                description: "Добро пожаловать в наше сообщество!",
            })
            router.push('/')
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка регистрации",
                description: error.message,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Container className="h-screen flex items-center justify-center overflow-hidden">
            <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-lg">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Регистрация</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">
                            Имя пользователя
                        </label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Введите имя пользователя"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            maxLength={30}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Введите email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            minLength={8}
                        />
                        <p className="text-xs text-gray-500">
                            Минимум 8 символов
                        </p>
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </Button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Уже есть аккаунт?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Войти
                    </Link>
                </p>
            </div>
        </Container>
    )
}