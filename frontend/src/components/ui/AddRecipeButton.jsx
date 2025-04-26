"use client"

import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Plus } from "lucide-react";

import { useRouter } from 'next/navigation';

export default function AddRecipeButton() {
    const router = useRouter();

    const handleAddRecipe = () => {
      router.push('/recipe/add');
    };

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full"
                  onClick={handleAddRecipe}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className="bg-primary text-primary-foreground px-3 py-1.5 text-sm rounded-md shadow-sm"
                sideOffset={5}
              >
                Добавить рецепт
              </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}