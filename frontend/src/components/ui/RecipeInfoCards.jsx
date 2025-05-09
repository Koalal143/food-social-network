import { Clock, User, Heart } from "lucide-react"

export default function RecipeInfoCards({ recipe }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 m-4">
            <div className="bg-card p-4 rounded-lg flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-sm font-medium">Время</h3>
                <p className="text-sm text-muted-foreground">{recipe.time}</p>
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg flex items-center gap-3">
              <User className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-sm font-medium">Порций</h3>
                <p className="text-sm text-muted-foreground">{recipe.servings}</p>
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg flex items-center gap-3">
              <Heart className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-sm font-medium">Сложность</h3>
                <p className="text-sm text-muted-foreground capitalize">{recipe.difficulty}</p>
              </div>
            </div>
        </div>
    )
}