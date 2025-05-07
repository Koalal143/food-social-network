"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { LogOut, User, PlusCircle } from 'lucide-react'
import Container from './Container'
import SearchInput from '../ui/SearchInput'

export default function Header() {
    const { user, logout } = useAuth()
    const router = useRouter()

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Container>
                <div className="flex h-16 items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <h1 className="text-lg font-bold">РЕЦЕПТЫ</h1>
                    </Link>

                    <div className="flex-1 max-w-xl">
                        <SearchInput />
                    </div>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <Button 
                                    variant="default" 
                                    size="sm"
                                    asChild
                                    className="hidden md:flex"
                                >
                                    <Link href="/recipe/add">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Добавить рецепт
                                    </Link>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            className="relative h-8 w-8 rounded-full"
                                        >
                                            <Image
                                                src={user.profile?.avatar_url || '/images/default-avatar.png'}
                                                alt={user.username || 'Avatar'}
                                                className="rounded-full object-cover"
                                                fill
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile" className="flex items-center">
                                                <User className="mr-2 h-4 w-4" />
                                                Профиль
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-600" 
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Выйти
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/login">
                                        Войти
                                    </Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/registration">
                                        Регистрация
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Container>
        </header>
    )
}