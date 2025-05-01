import Container from '@/components/Container';
import AddRecipeForm from '@/components/AddRecipeForm';

export default function AddRecipePage() {
  return (
    <div className="py-8">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Добавить новый рецепт</h1>
          <AddRecipeForm />
        </div>
      </Container>
    </div>
  );
} 