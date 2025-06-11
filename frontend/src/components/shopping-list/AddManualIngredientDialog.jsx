"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import ShoppingListService from '@/services/shopping-list.service'
import AuthService from '@/services/auth.service'
import { handleApiError } from '@/utils/errorHandler'
import { AuthError } from '@/utils/errors'

/**
 * Диалог для добавления ингредиента вручную
 * @param {Function} onIngredientAdded - колбэк при успешном добавлении
 */
export default function AddManualIngredientDialog({ onIngredientAdded }) {
    const { toast } = useToast()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        quantity: ''
    })
    const [errors, setErrors] = useState({})
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Проверка авторизации при открытии диалога
    useEffect(() => {
        if (open) {
            const authenticated = AuthService.isAuthenticated()
            setIsAuthenticated(authenticated)

            if (!authenticated) {
                toast({
                    variant: "destructive",
                    title: "Требуется авторизация",
                    description: "Для добавления ингредиентов необходимо войти в систему",
                })
                setOpen(false)
                router.push('/auth/login')
            }
        }
    }, [open, toast, router])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        
        // Очищаем ошибку при изменении поля
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        
        const name = formData.name.trim()
        if (!name) {
            newErrors.name = 'Название ингредиента обязательно'
        } else if (name.length < 2) {
            newErrors.name = 'Название должно содержать минимум 2 символа'
        } else if (name.length > 135) {
            newErrors.name = 'Название не должно превышать 135 символов'
        }

        const quantity = formData.quantity.trim()
        if (quantity && quantity.length > 50) {
            newErrors.quantity = 'Количество не должно превышать 50 символов'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        try {
            setLoading(true)

            const addedItem = await ShoppingListService.addManualIngredient(
                formData.name.trim(),
                formData.quantity.trim()
            )

            setFormData({ name: '', quantity: '' })
            setErrors({})
            setOpen(false)

            if (onIngredientAdded) {
                onIngredientAdded(addedItem)
            }

        } catch (error) {
            if (error instanceof AuthError) {
                setIsAuthenticated(false)
                toast({
                    variant: "destructive",
                    title: "Требуется авторизация",
                    description: "Для добавления ингредиентов необходимо войти в систему",
                })
                setOpen(false)
                router.push('/auth/login')
            } else {
                const { message, type } = handleApiError(error)
                toast({
                    variant: type,
                    title: "Ошибка добавления",
                    description: message,
                })
            }
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setOpen(false)
        setFormData({ name: '', quantity: '' })
        setErrors({})
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 w-full sm:w-auto h-10 md:h-9 touch-manipulation">
                    <Plus className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Добавить ингредиент</span>
                    <span className="sm:hidden">Добавить</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="mx-4 max-w-md sm:max-w-md w-[calc(100vw-2rem)] sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-lg md:text-xl">Добавить ингредиент</DialogTitle>
                    <DialogDescription className="text-sm md:text-base">
                        Добавьте ингредиент в список покупок вручную
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="ingredient-name" className="text-sm md:text-sm font-medium">
                            Название ингредиента <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="ingredient-name"
                            placeholder="Например: Молоко"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`h-10 md:h-9 text-base md:text-sm touch-manipulation ${errors.name ? 'border-red-500' : ''}`}
                            maxLength={135}
                            disabled={loading}
                            autoComplete="off"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ingredient-quantity" className="text-sm md:text-sm font-medium">
                            Количество
                        </Label>
                        <Input
                            id="ingredient-quantity"
                            placeholder="Например: 1 литр"
                            value={formData.quantity}
                            onChange={(e) => handleInputChange('quantity', e.target.value)}
                            className={`h-10 md:h-9 text-base md:text-sm touch-manipulation ${errors.quantity ? 'border-red-500' : ''}`}
                            maxLength={50}
                            disabled={loading}
                            autoComplete="off"
                        />
                        {errors.quantity && (
                            <p className="text-sm text-red-500">{errors.quantity}</p>
                        )}
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                            className="w-full sm:w-auto h-10 md:h-9 touch-manipulation"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !formData.name.trim()}
                            className="w-full sm:w-auto h-10 md:h-9 touch-manipulation"
                        >
                            {loading ? 'Добавление...' : 'Добавить'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
