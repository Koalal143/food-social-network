export default function RecipeIngridients({ recipe }) {
    return (
        <section className="m-4">
            <h2 className="text-2xl font-bold mb-4">Ингредиенты</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-base">{ingredient.name}</span>
                  <span className="text-base right-0">{ingredient.quantity}</span>
                </li>
              ))}
            </ul>
        </section>
    )
}