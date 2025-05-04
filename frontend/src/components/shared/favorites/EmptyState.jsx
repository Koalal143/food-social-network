import { CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmptyState({ hasFavorites }) {
  return (
    <CardContent className="text-center py-12">
      {!hasFavorites ? (
        <div className="max-w-md mx-auto space-y-6">
          <CardTitle className="text-2xl font-bold mb-4">У вас пока нет избранных рецептов</CardTitle>
          <CardDescription className="text-muted-foreground mb-8">
            Добавляйте понравившиеся рецепты в избранное, чтобы быстро находить их позже
          </CardDescription>
          <Button 
            className="w-full md:w-auto"
            onClick={() => window.location.href = '/recommendations'}
          >
            Найти рецепты
          </Button>
        </div>
      ) : (
        <p className="text-xl text-muted-foreground">
          По вашему запросу ничего не найдено
        </p>
      )}
    </CardContent>
  );
} 