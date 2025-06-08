import { Clock, ChefHat } from "lucide-react"
import minutesToHuman from "@/utils/minutesToHuman"
import { DIFFICULTY } from "@/constants/difficulty"

export default function RecipeInfoCards({ recipe }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div className="p-3 rounded-lg flex items-center gap-2.5 shadow-sm border">
        <Clock className="w-4 h-4 text-primary" />
        <div>
          <h3 className="text-sm font-semibold">Время</h3>
          <p className="text-xs text-muted-foreground">{minutesToHuman(recipe.cook_time_minutes)}</p>
        </div>
      </div>
      <div className="p-3 rounded-lg flex items-center gap-2.5 shadow-sm border">
        <ChefHat className="w-4 h-4 text-primary" />
        <div>
          <h3 className="text-sm font-semibold">Сложность</h3>
          <p className="text-xs text-muted-foreground capitalize">{DIFFICULTY[recipe.difficulty]}</p>
        </div>
      </div>
    </div>
  )
}