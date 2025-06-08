"use client";

import Image from "next/image";
import { Button } from "../button";
import { Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { fileSchema } from "@/lib/schemas/file.schema";
import PhotoUploadInfo from "../PhotoUploadInfo";

export default function EditableProfilePhoto({ user, className = "" }) {
    const { toast } = useToast();
    const { updateAvatar, deleteAvatar } = useAuth()

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Валидация файла
            fileSchema.parse({ file });
            
            await updateAvatar(file);
            toast({
                title: "Успешно",
                description: "Фото профиля обновлено",
            });
        } catch (error) {
            // Если ошибка от Zod (валидация)
            if (error.errors) {
                toast({
                    variant: "destructive",
                    title: "Ошибка",
                    description: error.errors[0]?.message,
                });
                return;
            }

            // Если ошибка от API
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: error.message || "Не удалось обновить фото профиля",
            });
        }
    };

    const handleDeleteAvatar = async () => {
        try {
            await deleteAvatar();
            toast({
                title: "Успешно",
                description: "Фото профиля удалено",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: error.message || "Не удалось удалить фото профиля",
            });
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className={`flex flex-col items-center space-y-4 ${className}`}>
            <div className="relative h-40 w-40 group">
                <Image
                    src={user.profile?.avatar_url || '/images/user-dummy.svg'}
                    alt={user.username || 'Avatar'}
                    className="rounded-full object-cover bg-secondary"
                    fill
                    priority
                    unoptimized={true}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full">
                    <div className="flex gap-2">
                        <Button 
                            variant="secondary" 
                            size="sm"
                            className="relative"
                        >
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/jpeg,image/jpg,image/png,image/gif"
                                onChange={handleAvatarUpload}
                            />
                            <Upload className="h-4 w-4" />
                        </Button>
                        {user.profile?.avatar_url && (
                            <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={handleDeleteAvatar}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <div className="text-center">
                <PhotoUploadInfo
                    recommendedSize="400×400px (квадрат)"
                    maxFileSize="5MB"
                    formats="JPG, PNG, GIF"
                    className="justify-center"
                />
            </div>
        </div>
    );
}