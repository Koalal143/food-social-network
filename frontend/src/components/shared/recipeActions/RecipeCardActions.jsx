"use client"

import { useState } from 'react'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/context/AuthContext'
import DeleteRecipeDialog from './DeleteRecipeDialog'

export default function RecipeCardActions({ recipe, className = "" }) {
    const [isOpen, setIsOpen] = useState(false)
    // const { user } = useAuth()

    // Проверяем, может ли пользователь редактировать/удалять рецепт
    // const canModifyRecipe = user && recipe && (
    //     user.id === recipe.author?.id || user.is_superuser
    // )

    // Если пользователь не может модифицировать рецепт, не показываем меню
    // if (!canModifyRecipe) {
    //     return null
    // }

    const handleEdit = (e) => {
        e.preventDefault()
        e.stopPropagation()
        // TODO: Реализовать редактирование рецепта
        console.log('Редактирование рецепта:', recipe.id)
    }

    return (
        <div className={className} onClick={(e) => e.stopPropagation()}>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 bg-background/60"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="w-4 h-4 mr-2" />
                        Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => {
                            e.preventDefault()
                            setIsOpen(false)
                        }}
                    >
                        <DeleteRecipeDialog 
                            recipe={recipe}
                            trigger={
                                <div className="flex items-center w-full">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Удалить
                                </div>
                            }
                        />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}