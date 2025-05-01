import Image from 'next/image';
import Container from '@/components/Container';

// Временные данные для демонстрации
const recipe = {
  id: 1,
  title: 'Запеканка из овсяных хлопьев с арахисом и изюмом',
  description: 'Вкусная, нежная и сытная запеканка.',
  image: '/images/recipes/oatmeal.jpg',
  cookingTime: '1 ч 10 м',
  servings: 4,
  difficulty: 'Легко',
  ingredients: [
    '200 г овсяных хлопьев',
    '100 г арахиса',
    '50 г изюма',
    '2 яйца',
    '500 мл молока',
    '50 г сливочного масла',
    '50 г меда',
    'щепотка соли'
  ],
  instructions: [
    'Разогрейте духовку до 180°C.',
    'Замочите овсяные хлопья в теплом молоке на 15 минут.',
    'Измельчите арахис в крупную крошку.',
    'Промойте изюм и обсушите его.',
    'Смешайте замоченные хлопья, арахис и изюм.',
    'Добавьте взбитые яйца, растопленное масло, мед и соль.',
    'Перемешайте все ингредиенты до однородной массы.',
    'Выложите массу в форму для запекания.',
    'Выпекайте 40-45 минут до золотистой корочки.'
  ]
};

export default function RecipePage() {
  return (
    <article className="py-8">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-[16/9] mb-8">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>

          <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
          <p className="text-lg text-muted-foreground mb-8">{recipe.description}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-medium mb-2">Время приготовления</h3>
              <p>{recipe.cookingTime}</p>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-medium mb-2">Порций</h3>
              <p>{recipe.servings}</p>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-medium mb-2">Сложность</h3>
              <p>{recipe.difficulty}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Ингредиенты</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Инструкция приготовления</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex space-x-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </Container>
    </article>
  );
} 