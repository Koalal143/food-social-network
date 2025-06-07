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
import { LogOut, User, PlusCircle, Search, Menu, X, Shield } from 'lucide-react'
import Container from './Container'
import SearchInput from '../ui/search/SearchInput'
import { useState } from 'react'

export default function Header() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const [showMobileSearch, setShowMobileSearch] = useState(false)

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    const toggleMobileSearch = () => {
        setShowMobileSearch(!showMobileSearch)
    }

    return (
        <>
            <Container>
                <header className="fixed top-0 left-0 right-0 z-50 glass-header">
                    <div className="py-2 flex items-center justify-between px-2">
                        {/* Логотип - скрывается при активном поиске на мобильном */}
                        <Link href="/" className={`flex items-center ${showMobileSearch ? 'hidden md:flex' : 'flex'}`}>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Pacifico, cursive' }}>ВкуСвайп</h1>
                        </Link>

                        {/* Основной контейнер с поиском */}
                        <div className={`${showMobileSearch ? 'flex-1' : 'hidden md:flex md:flex-1'} max-w-xl mx-2 md:mx-4`}>
                            <SearchInput setShowMobileSearch={setShowMobileSearch}/>
                        </div>

                        {/* Кнопки авторизации и профиля */}
                        <div className={`flex items-center gap-1 md:gap-2 ${showMobileSearch ? 'hidden md:flex' : 'flex'}`}>
                            {/* Кнопка поиска на мобильных устройствах */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden p-1 ml-1"
                                onClick={toggleMobileSearch}
                                aria-label={showMobileSearch ? "Закрыть поиск" : "Открыть поиск"}
                            >
                                {showMobileSearch ? (
                                    <X className="h-5 w-5 text-gray-700" />
                                ) : (
                                    <Search className="h-5 w-5 text-gray-700" />
                                )}
                            </Button>
                            {user ? (
                                <>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        asChild
                                        className="hidden md:flex bg-primary/90 hover:bg-primary/80"
                                    >
                                        <Link href="/recipe/add">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Добавить рецепт
                                        </Link>
                                    </Button>

                                    {/* Кнопка добавления для мобильных устройств */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="md:hidden p-1"
                                    >
                                        <Link href="/recipe/add">
                                            <PlusCircle className="h-5 w-5 text-gray-700" />
                                        </Link>
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="relative h-8 w-8 rounded-full hover:bg-gray-100/50"
                                            >
                                                <Image
                                                    src={user.profile?.avatar_url || '/images/user-dummy.svg'}
                                                    alt={user.username || 'Avatar'}
                                                    className="rounded-full object-cover bg-secondary"
                                                    fill
                                                    priority
                                                    unoptimized={true}
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
                                            {user?.is_superuser && (
                                                <DropdownMenuItem asChild>
                                                    <Link href="/system-management-panel" className="flex items-center">
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        Админ-панель
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}


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
                                    <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 text-xs md:text-sm">
                                        <Link href="/login">
                                            Войти
                                        </Link>
                                    </Button>
                                    <Button className="bg-primary/90 hover:bg-primary/80 text-white text-xs md:text-sm" size="sm" asChild>
                                        <Link href="/registration">
                                            Регистрация
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </header>
            </Container>
        </>
    )
}