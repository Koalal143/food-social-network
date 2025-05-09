export default function RecipeInstruction({ recipe }) {
    return (
        <section className="m-4">
            <h2 className="text-2xl font-bold mb-4">Инструкция</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="flex gap-4 p-4 bg-background rounded-lg">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <p className="text-base">{step}</p>
                </li>
              ))}
            </ol>
        </section>
    )
}