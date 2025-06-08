import Image from "next/image";

export default function RecipeInstruction({ recipe }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">Инструкция</h2>
      <ol className="space-y-4">
        {recipe.instructions.map((instruction, index) => (
          <li key={index} className="p-4 bg-background rounded-lg shadow-sm">
            <div className="flex gap-3 items-start mb-3">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium text-sm">
                {instruction.step_number}
              </span>
              <p className="text-sm leading-relaxed">{instruction.description}</p>
            </div>
            {instruction.image_url && (
              <div className="mt-3 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden">
                  <Image
                    src={instruction.image_url}
                    alt={`Шаг ${instruction.step_number}`}
                    fill
                    priority
                    unoptimized={true}
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}