"use client"

import { Home, Star, User, Plus, Bot } from "lucide-react"
import Container from "./Container"
import { Button } from "../ui/button"
import Link from "next/link"
import { usePathname } from 'next/navigation'

export default function MobileMenu() {
    const pathname = usePathname();

    const isActive = (path) => pathname === path;

    return (
        <Container className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around py-2 z-50">
            <Link href="/" passHref>
                <Button variant="icon" size="icon" className={`flex flex-col items-center ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Home className={`h-6 w-6 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={"text-xs"}>Главная</span>
                </Button>
            </Link>
            <Link href="/recommendations" passHref>
                <Button variant="icon" size="icon" className={`flex flex-col items-center ${isActive('/recommendations') ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Star className={`h-6 w-6 ${isActive('/recommendations') ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={"text-xs"}>Рекомендации</span>
                </Button>
            </Link>
            <Link href="/recipe-ai" passHref>
                <Button variant="icon" size="icon" className={`flex flex-col items-center ${isActive('/recipe-ai') ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Bot className={`h-6 w-6 ${isActive('/recipe-ai') ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={"text-xs"}>Шеф</span>
                </Button>
            </Link>
            <Link href="/profile" passHref>
                <Button variant="icon" size="icon" className={`flex flex-col items-center ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
                    <User className={`h-6 w-6 ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={"text-xs"}>Профиль</span>
                </Button>
            </Link>
        </Container>
    )
}