import Container from './Container';
import RecipeCard from './RecipeCard';

const RecipeGrid = ({ title, recipes, showMoreLink }) => {
  return (
    <section className="py-12">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          {showMoreLink && (
            <a href="/recipes" className="text-primary hover:underline">
              Смотреть все
            </a>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default RecipeGrid; 