"use client"

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
