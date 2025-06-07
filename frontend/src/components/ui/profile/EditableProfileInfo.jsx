import { useState } from 'react'
import { Button } from '../button'
import { Input } from '../input'
import { Pencil, Save, X } from 'lucide-react'
import { Textarea } from '../textarea'

export default function EditableProfileInfo({ 
    user,
    onSave,
    className = ''
}) {
    if (!user) {
        return
    }

    const [isEditing, setIsEditing] = useState(false)
    const [editValues, setEditValues] = useState({
        username: user.username,
        about: user.profile?.about || ''
    })

    const handleChange = (field) => (e) => {
        setEditValues(prev => ({
            ...prev,
            [field]: e.target.value
        }))
    }

    const handleSave = async () => {
        await onSave(editValues)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditValues({
            username: user.username,
            about: user.profile?.about || ''
        })
        setIsEditing(false)
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Сохранить
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-2" />
                            Отмена
                        </Button>
                    </div>
                ) : (
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="right-0"
                        onClick={() => setIsEditing(true)}
                    >
                        <Pencil className="h-4 w-4 mr-2" />
                        Редактировать
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Юзернейм</label>
                    {isEditing ? (
                        <Input
                            value={editValues.username}
                            onChange={handleChange('username')}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">{user.username}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">О себе</label>
                    {isEditing ? (
                        <Textarea
                            value={editValues.about}
                            onChange={handleChange('about')}
                            className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border resize-none"
                            placeholder="Расскажите о себе..."
                        />
                    ) : (
                        <div className="text-base text-foreground/80 leading-relaxed">
                            {user.profile?.about ? (
                                <p className="whitespace-pre-wrap">{user.profile.about}</p>
                            ) : (
                                <p className="text-muted-foreground italic">Не указано</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Дата регистрации</label>
                    <p className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                </div>
            </div>
        </div>
    )
} 