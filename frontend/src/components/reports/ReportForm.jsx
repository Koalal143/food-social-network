"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandler";
import ReportsService from "@/services/reports.service";
import { 
    reportCreateSchema, 
    REPORT_REASONS, 
    REPORT_REASON_LABELS 
} from "@/lib/schemas/report.schema";

export default function ReportForm({ 
    recipeId, 
    onSuccess, 
    onError, 
    onSubmittingChange,
    disabled = false 
}) {
    const { toast } = useToast();
    
    const form = useForm({
        resolver: zodResolver(reportCreateSchema),
        defaultValues: {
            reason: "",
            description: ""
        }
    });

    const onSubmit = async (data) => {
        try {
            onSubmittingChange?.(true);
            
            await ReportsService.createRecipeReport(
                recipeId,
                data.reason,
                data.description || null
            );
            
            onSuccess?.();
        } catch (error) {
            const { message, type } = handleApiError(error);
            toast({
                variant: type,
                title: "Ошибка отправки жалобы",
                description: message,
            });
            onError?.();
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Причина жалобы</FormLabel>
                            <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                                disabled={disabled}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите причину" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.entries(REPORT_REASON_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Дополнительное описание (необязательно)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Опишите проблему подробнее..."
                                    className="resize-none"
                                    rows={3}
                                    disabled={disabled}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="submit"
                        disabled={disabled}
                        className="min-w-[100px]"
                    >
                        {disabled ? "Отправка..." : "Отправить"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
