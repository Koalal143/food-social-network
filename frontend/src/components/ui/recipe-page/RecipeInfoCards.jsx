import { Clock, Heart } from "lucide-react"
import minutesToHuman from "@/utils/minutesToHuman"
import { DIFFICULTY } from "@/constants/difficulty"

export default function RecipeInfoCards({ recipe }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 m-4">
            <div className="bg-card p-4 rounded-lg flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-sm font-medium">Время</h3>
                <p className="text-sm text-muted-foreground">{minutesToHuman(recipe.cook_time_minutes)}</p>
              </div>
            </div>
            {/* <div className="bg-card p-4 rounded-lg flex items-center gap-3">
              <User className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-sm font-medium">Порций</h3>
                <p className="text-sm text-muted-foreground">{recipe.servings}</p>
              </div>
            </div> */}
            <div className="bg-card p-4 rounded-lg flex items-center gap-3">
              <Heart className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-sm font-medium">Сложность</h3>
                <p className="text-sm text-muted-foreground capitalize">{DIFFICULTY[recipe.difficulty]}</p>
              </div>
            </div>
        </div>
    )
}