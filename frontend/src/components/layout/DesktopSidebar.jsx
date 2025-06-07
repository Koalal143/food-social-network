"use client"

import { Home, Star, User, Bot, PanelLeftClose, PanelLeft, Cookie, FileText } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';

export default function DesktopSidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();

    const isActive = (path) => pathname === path;

    return (
        <aside className={`hidden md:block fixed pt-[60px] left-0 h-[100vh] bg-background border-r transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-16' : 'w-56'
        }`}>
            <div className="flex flex-col h-full">
                <nav className={`space-y-4 ${isCollapsed ? 'px-2' : 'px-4'} flex-1 pt-2 pb-4`}>
                    <Link href="/" passHref>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`w-full h-11 ${isCollapsed ? 'justify-center px-0' : 'justify-start px-3'} ${isActive('/') ? 'bg-accent' : ''} hover:bg-accent/80 rounded-lg`}
                            title={isCollapsed ? 'Главная' : ''}
                        >
                            <Home className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
                            {!isCollapsed && <span className="text-sm font-medium">Главная</span>}
                        </Button>
                    </Link>
                    <Link href="/recommendations" passHref>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`w-full h-11 ${isCollapsed ? 'justify-center px-0' : 'justify-start px-3'} ${isActive('/recommendations') ? 'bg-accent' : ''} hover:bg-accent/80 rounded-lg`}
                            title={isCollapsed ? 'Рекомендации' : ''}
                        >
                            <Star className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
                            {!isCollapsed && <span className="text-sm font-medium">Рекомендации</span>}
                        </Button>
                    </Link>
                    <Link href="/profile" passHref>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`w-full h-11 ${isCollapsed ? 'justify-center px-0' : 'justify-start px-3'} ${isActive('/profile') ? 'bg-accent' : ''} hover:bg-accent/80 rounded-lg`}
                            title={isCollapsed ? 'Профиль' : ''}
                        >
                            <User className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
                            {!isCollapsed && <span className="text-sm font-medium">Профиль</span>}
                        </Button>
                    </Link>
                </nav>
                {/* Ссылка на документацию */}
                <nav className={`space-y-4 ${isCollapsed ? 'px-2' : 'px-4'} flex-end pt-2 pb-4`}>
                    <Link href="/docs" passHref>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`w-full h-11 ${isCollapsed ? 'justify-center px-0' : 'justify-start px-3'} ${isActive('/docs') ? 'bg-accent' : ''} hover:bg-accent/80 rounded-lg`}
                            title={isCollapsed ? 'Политики' : ''}
                        >
                            <FileText className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
                            {!isCollapsed && <span className="text-sm font-medium">Политики</span>}
                        </Button>
                    </Link>
                </nav>
                {/* Кнопка переключения в правом нижнем углу */}
                <div className={`${isCollapsed ? 'px-2' : 'px-4'} pb-6 pt-4 flex ${isCollapsed ? 'justify-center' : 'justify-end'} border-t border-border/50`}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-accent/80 rounded-md"
                        onClick={toggleSidebar}
                        title={isCollapsed ? "Развернуть сайдбар" : "Свернуть сайдбар"}
                    >
                        {isCollapsed ? (
                            <PanelLeft className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
                        )}
                    </Button>
                </div>
            </div>
        </aside>
    );
}