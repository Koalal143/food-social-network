"use client"

import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import { handleApiError } from '@/utils/errorHandler'

/**
 * Диалог для добавления ингредиента вручную
 * @param {Function} onIngredientAdded - колбэк при успешном добавлении
 */
export default function AddManualIngredientDialog({ onIngredientAdded }) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        quantity: ''
    })
    const [errors, setErrors] = useState({})

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

            toast({
                variant: "default",
                title: "Ингредиент добавлен",
                description: `"${addedItem.name}" добавлен в список покупок`,
            })

            setFormData({ name: '', quantity: '' })
            setErrors({})
            setOpen(false)

            if (onIngredientAdded) {
                onIngredientAdded(addedItem)
            }

        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка добавления",
                description: message,
            })
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
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Добавить ингредиент
                </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Добавить ингредиент</DialogTitle>
                    <DialogDescription>
                        Добавьте ингредиент в список покупок вручную
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="ingredient-name">
                            Название ингредиента <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="ingredient-name"
                            placeholder="Например: Молоко"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={errors.name ? 'border-red-500' : ''}
                            maxLength={135}
                            disabled={loading}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ingredient-quantity">Количество</Label>
                        <Input
                            id="ingredient-quantity"
                            placeholder="Например: 1 литр"
                            value={formData.quantity}
                            onChange={(e) => handleInputChange('quantity', e.target.value)}
                            className={errors.quantity ? 'border-red-500' : ''}
                            maxLength={50}
                            disabled={loading}
                        />
                        {errors.quantity && (
                            <p className="text-sm text-red-500">{errors.quantity}</p>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !formData.name.trim()}
                        >
                            {loading ? 'Добавление...' : 'Добавить'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
