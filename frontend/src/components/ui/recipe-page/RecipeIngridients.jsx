export default function RecipeIngridients({ recipe }) {
    return (
      <section className="m-4">
        <h2 className="text-2xl font-bold mb-4">Ингредиенты</h2>
        <ul className="space-y-3">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-center justify-between p-3 bg-background rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
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