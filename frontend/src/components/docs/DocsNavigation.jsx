"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Settings, Shield, Cookie } from "lucide-react";

/**
 * Компонент навигации по документам
 */
const DocsNavigation = () => {
    const pathname = usePathname();

    const isActive = (path) => pathname === path;

    const navItems = [
        {
            href: "/docs/policy",
            label: "Политика конфиденциальности",
            icon: Shield,
            description: "Обработка персональных данных и cookie"
        },
        {
            href: "/docs/recommendations-policy",
            label: "Политика рекомендательных систем",
            icon: Settings,
            description: "Принципы работы алгоритмов рекомендаций"
        },
        {
            href: "/docs/cookies",
            label: "Управление куки-файлами",
            icon: Cookie,
            description: "Настройки и удаление cookie"
        }
    ];

    return (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Документы
            </h3>
            <div className="space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive(item.href) ? "default" : "ghost"}
                                className="w-full justify-start h-auto p-3"
                            >
                                <div className="flex items-start">
                                    <Icon className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                                    <div className="text-left">
                                        <div className="font-medium">{item.label}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {item.description}
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default DocsNavigation;
