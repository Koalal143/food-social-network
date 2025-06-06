import Image from "next/image";

export default function RecipeInstruction({ recipe }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Инструкция</h2>
      <ol className="space-y-6">
        {recipe.instructions.map((instruction, index) => (
          <li key={index} className="p-5 bg-background rounded-xl shadow-sm">
            <div className="flex gap-5 items-start mb-4">
              <span className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium text-lg">
                {instruction.step_number}
              </span>
              <p className="text-lg">{instruction.description}</p>
            </div>
            {instruction.image_url && (
              <div className="mt-4 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
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