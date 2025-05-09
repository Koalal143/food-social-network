import { Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "../button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function EditableProfilePhoto({ user }) {
    const { toast } = useToast()
    const { updateAvatar, deleteAvatar } = useAuth()

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0]
        console.log(file);
        
        if (!file) return

        try {
            await updateAvatar(file)
            toast({
                title: "Аватар обновлен",
                description: "Ваш аватар успешно обновлен"
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: error.message
            })
        }
    }

    const handleDeleteAvatar = async () => {
        try {
            await deleteAvatar()
            toast({
                title: "Аватар удален",
                description: "Ваш аватар успешно удален"
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: error.message
            })
        }
    }

    if (!user) {
        return
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative h-40 w-40">
                <Image
                    src={user.profile?.avatar_url || '/images/user-dummy.svg'}
                    alt={user.username || 'Avatar'}
                    className="rounded-full object-cover"
                    fill
                    priority
                    unoptimized={true}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-full">
                    <div className="flex gap-2">
                        <Button 
                            variant="secondary" 
                            size="sm"
                            className="relative"
                        >
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
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
            <p className="text-xs text-muted-foreground text-center">
                Разрешены JPG, GIF или PNG. Максимальный размер 5MB.
            </p>
        </div>
    )
}