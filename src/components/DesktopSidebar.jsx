import { Home, Star, User } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function DesktopSidebar() {
    return (
        <aside className="hidden md:block fixed pt-[60px] left-0 h-[100vh] w-64 bg-background border-r">
            <nav className="space-y-2 pl-6">
                <Link href="/" passHref>
                    <Button variant="ghost" className="pt-2 w-full justify-start">
                        <Home className="mr-2 h-4 w-4" />
                        Главная
                    </Button>
                </Link>
                <Link href="/recommendations" passHref>
                    <Button variant="ghost" className="w-full justify-start">
                        <Star className="mr-2 h-4 w-4" />
                        Рекомендации
                    </Button>
                </Link>
                <Link href="/profile" passHref>
                    <Button variant="ghost" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Профиль
                    </Button>
                </Link>
            </nav>
        </aside>
    );
}