"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogIn, UserPlus } from 'lucide-react'

export default function AuthRequiredCard({ 
    icon: Icon, 
    title, 
    description,
    className = ""
}) {
    const router = useRouter()

    return (
        <div className={`py-8 ${className}`}>
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <CardContent className="py-8 px-6">
                        <div className="text-center">
                            <Icon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">Требуется авторизация</h3>
                            <p className="text-muted-foreground mb-6">
                                {description}
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={() => router.push('/login')}
                                    className="w-full"
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Войти в систему
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/registration')}
                                    className="w-full"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Создать аккаунт
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
