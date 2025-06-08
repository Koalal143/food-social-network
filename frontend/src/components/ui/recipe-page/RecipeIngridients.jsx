export default function RecipeIngridients({ recipe, showTitle = false }) {
    return (
      <section className="space-y-3">
        {showTitle && <h2 className="text-lg font-bold">Ингредиенты</h2>}
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-center justify-between p-3 bg-background rounded-lg shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0" />
                <span className="text-sm">{ingredient.name}</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {ingredient.quantity}
              </span>
            </li>
          ))}
        </ul>
      </section>
    )
}