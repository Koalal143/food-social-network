export default function RecipeIngridients({ recipe }) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Ингредиенты</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-center justify-between p-4 bg-background rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-primary rounded-full flex-shrink-0" />
                <span className="text-base">{ingredient.name}</span>
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                {ingredient.quantity}
              </span>
            </li>
          ))}
        </ul>
      </section>
    )
}