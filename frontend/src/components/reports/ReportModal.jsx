"use client"

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ReportForm from "./ReportForm";

export default function ReportModal({ 
    isOpen, 
    onClose, 
    recipeId, 
    recipeName,
    onSuccess 
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSuccess = () => {
        setIsSubmitting(false);
        onSuccess?.();
    };

    const handleError = () => {
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-semibold">
                            Пожаловаться на рецепт
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {recipeName && (
                            <>Рецепт: <span className="font-medium">{recipeName}</span><br /></>
                        )}
                        Выберите причину жалобы и при необходимости добавьте описание.
                    </DialogDescription>
                </DialogHeader>

                <ReportForm
                    recipeId={recipeId}
                    onSuccess={handleSuccess}
                    onError={handleError}
                    onSubmittingChange={setIsSubmitting}
                    disabled={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    );
}
