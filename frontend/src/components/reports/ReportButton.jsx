"use client"

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ReportModal from "./ReportModal";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ReportButton({ 
    recipeId, 
    recipeName,
    variant = "ghost", 
    size = "sm", 
    className = "",
    showText = false,
    disabled = false
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isAuth } = useAuth();
    const { toast } = useToast();

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuth) {
            toast({
                title: "Требуется авторизация",
                description: "Войдите в аккаунт, чтобы подать жалобу",
                variant: "default"
            });
            return;
        }

        setIsModalOpen(true);
    };

    const handleReportSuccess = () => {
        setIsModalOpen(false);
        toast({
            title: "Жалоба отправлена",
            description: "Спасибо за обращение. Мы рассмотрим вашу жалобу в ближайшее время.",
        });
    };

    const buttonContent = (
        <Button
            variant={variant}
            size={size}
            className={`gap-1.5 ${className}`}
            onClick={handleClick}
            disabled={disabled}
        >
            <Flag className="w-3.5 h-3.5" />
            {showText && <span>Пожаловаться</span>}
        </Button>
    );

    return (
        <>
            {!isAuth ? (
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {buttonContent}
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Войдите в аккаунт, чтобы подать жалобу</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
                buttonContent
            )}
            
            <ReportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                recipeId={recipeId}
                recipeName={recipeName}
                onSuccess={handleReportSuccess}
            />
        </>
    );
}
