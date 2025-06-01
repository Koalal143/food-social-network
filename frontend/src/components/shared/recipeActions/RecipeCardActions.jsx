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
import { useRouter } from 'next/navigation'
import DeleteRecipeDialog from './DeleteRecipeDialog'

export default function RecipeCardActions({ recipe, className = "" }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const router = useRouter()

    const handleEdit = (e) => {
        e.preventDefault()
        e.stopPropagation()
        router.push(`/recipe/edit/${recipe.slug}`)
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
                <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="w-4 h-4 mr-2" />
                        Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => {
                            e.preventDefault()
                            setIsDeleteDialogOpen(true)
                        }}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DeleteRecipeDialog
                className="hidden"
                recipe={recipe}
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            />
        </div>
    )
}