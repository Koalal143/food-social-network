"use client";
import { useRecipes } from "@/context/RecipeContext";
import Container from "@/components/layout/Container";
import Loader from "@/components/ui/Loader";
import InfiniteRecipesList from "@/components/shared/InfiniteRecipeList";

export default function App() {
  const { recipes, loading, hasMore, fetchRecipes } = useRecipes();

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchRecipes();
    }
  };

  if (loading && recipes.length === 0) {
    return <Loader />;
  }

  return (
    <Container className="py-6 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Популярные рецепты</h2>
      </div>

      <InfiniteRecipesList
        recipes={recipes}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        source="feed"
      />
      
      {hasMore && !loading && (
        <button 
          onClick={handleLoadMore}
          className="mx-auto block px-4 py-2 bg-primary text-white rounded-md mt-4"
        >
          Загрузить еще рецепты
        </button>
      )}
    </Container>
  );
}