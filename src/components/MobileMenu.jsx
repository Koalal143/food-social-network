import { Home, Star, User } from "lucide-react"
import Container from "./Container"
import { Button } from "./ui/button"
import Link from "next/link"

export default function MobileMenu() {
    return (
        <Container className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around py-2 z-50">
            <Link href="/" passHref>
                <Button variant="ghost" size="icon" className="flex flex-col items-center">
                    <Home className="h-6 w-6" />
                    <span className="text-xs">Главная</span>
                </Button>
            </Link>
            <Link href="/recommendations" passHref>
                <Button variant="ghost" size="icon" className="flex flex-col items-center">
                    <Star className="h-6 w-6" />
                    <span className="text-xs">Рекомендации</span>
                </Button>
            </Link>
            <Link href="/profile" passHref>
                <Button variant="ghost" size="icon" className="flex flex-col items-center">
                    <User className="h-6 w-6" />
                    <span className="text-xs">Профиль</span>
                </Button>
            </Link>
        </Container>
    )
}