import { z } from "zod";

export const REPORT_REASONS = {
    SPAM: "spam",
    INAPPROPRIATE_CONTENT: "inappropriate_content", 
    COPYRIGHT: "copyright",
    FAKE_RECIPE: "fake_recipe",
    OTHER: "other"
};

export const REPORT_STATUSES = {
    PENDING: "pending",
    REVIEWED: "reviewed", 
    RESOLVED: "resolved",
    DISMISSED: "dismissed"
};

export const REPORT_REASON_LABELS = {
    [REPORT_REASONS.SPAM]: "Спам",
    [REPORT_REASONS.INAPPROPRIATE_CONTENT]: "Неподходящий контент",
    [REPORT_REASONS.COPYRIGHT]: "Нарушение авторских прав",
    [REPORT_REASONS.FAKE_RECIPE]: "Поддельный рецепт",
    [REPORT_REASONS.OTHER]: "Другое"
};

export const REPORT_STATUS_LABELS = {
    [REPORT_STATUSES.PENDING]: "На рассмотрении",
    [REPORT_STATUSES.REVIEWED]: "Рассмотрено",
    [REPORT_STATUSES.RESOLVED]: "Решено",
    [REPORT_STATUSES.DISMISSED]: "Отклонено"
};

export const reportCreateSchema = z.object({
    reason: z.enum([
        REPORT_REASONS.SPAM,
        REPORT_REASONS.INAPPROPRIATE_CONTENT,
        REPORT_REASONS.COPYRIGHT,
        REPORT_REASONS.FAKE_RECIPE,
        REPORT_REASONS.OTHER
    ], {
        required_error: "Выберите причину жалобы",
        invalid_type_error: "Выберите причину жалобы"
    }),
    description: z
        .string()
        .max(500, "Описание не должно превышать 500 символов")
        .optional()
        .or(z.literal(""))
});

export const reportUpdateSchema = z.object({
    status: z.enum([
        REPORT_STATUSES.PENDING,
        REPORT_STATUSES.REVIEWED,
        REPORT_STATUSES.RESOLVED,
        REPORT_STATUSES.DISMISSED
    ], {
        required_error: "Выберите статус",
        invalid_type_error: "Выберите статус"
    }).optional(),
    admin_notes: z
        .string()
        .max(1000, "Заметки администратора не должны превышать 1000 символов")
        .optional()
        .or(z.literal(""))
});
