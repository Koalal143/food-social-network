import { Clock, ChefHat } from "lucide-react"
import minutesToHuman from "@/utils/minutesToHuman"
import { DIFFICULTY } from "@/constants/difficulty"

export default function RecipeInfoCards({ recipe }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="p-6 rounded-xl flex items-center gap-4 shadow-sm">
        <Clock className="w-8 h-8 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Время</h3>
          <p className="text-sm text-muted-foreground">{minutesToHuman(recipe.cook_time_minutes)}</p>
        </div>
      </div>
      <div className="p-6 rounded-xl flex items-center gap-4 shadow-sm">
        <ChefHat className="w-8 h-8 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Сложность</h3>
          <p className="text-sm text-muted-foreground capitalize">{DIFFICULTY[recipe.difficulty]}</p>
        </div>
      </div>
    </div>
  )
}