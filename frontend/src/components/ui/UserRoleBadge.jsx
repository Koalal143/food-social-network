import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Shield, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Компонент для отображения бейджей ролей пользователей с интерактивными подсказками
 */
export default function UserRoleBadge({ user, className = "" }) {
    const [isMobileTooltipOpen, setIsMobileTooltipOpen] = useState(false)

    if (!user) return null

    // Определяем роль пользователя
    const getUserRole = () => {
        if (user.is_superuser || user.role === "superuser") {
            return {
                type: "superuser",
                label: "Владелец",
                icon: Crown,
                description: "Официальный аккаунт владельца платформы, не доверяйте мошенникам",
                className: "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-700 border-yellow-500/20 hover:from-yellow-500/20 hover:to-orange-500/20"
            }
        }

        if (user.role === "admin") {
            return {
                type: "admin",
                label: "Администратор",
                icon: Shield,
                description: "Официальный аккаунт администратора платформы, не доверяйте мошенникам",
                className: "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border-blue-500/20 hover:from-blue-500/20 hover:to-indigo-500/20"
            }
        }

        return null
    }

    const roleInfo = getUserRole()

    if (!roleInfo) return null

    const Icon = roleInfo.icon

    const handleMobileClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsMobileTooltipOpen(!isMobileTooltipOpen)
    }

    const badgeContent = (
        <Badge
            variant="outline"
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-all duration-200 cursor-help",
                roleInfo.className,
                className
            )}
        >
            <Icon className="w-3 h-3" />
            <span>{roleInfo.label}</span>
        </Badge>
    )

    return (
        <div className="relative">
            {/* Десктопная версия с Tooltip */}
            <div className="hidden sm:block">
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {badgeContent}
                        </TooltipTrigger>
                        <TooltipContent
                            side="top"
                            className="max-w-xs text-sm"
                            sideOffset={5}
                        >
                            <p>{roleInfo.description}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Мобильная версия с кликабельным tooltip */}
            <div className="sm:hidden">
                <button
                    onClick={handleMobileClick}
                    className="flex items-center"
                    aria-label={`Показать описание роли: ${roleInfo.label}`}
                >
                    {badgeContent}
                </button>

                {isMobileTooltipOpen && (
                    <>
                        {/* Overlay для закрытия при клике вне */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsMobileTooltipOpen(false)}
                        />

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                            <div className={cn(
                                "px-3 py-2 text-sm rounded-lg shadow-lg border max-w-xs",
                                "bg-white text-gray-900 border-gray-200",
                                "before:content-[''] before:absolute before:top-full before:left-1/2",
                                "before:transform before:-translate-x-1/2 before:border-4",
                                "before:border-transparent before:border-t-white"
                            )}>
                                <p className="text-center">{roleInfo.description}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
