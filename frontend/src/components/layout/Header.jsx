import Container from "./Container";
import SearchInput from "../ui/SearchInput";
import AddRecipeButton from "../ui/AddRecipeButton";

export default function Header() {
  return (
    <Container>
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground">
        <div className="py-2 flex items-center justify-between px-4">
          <h1 className="text-lg font-bold hidden md:block">РЕЦЕПТЫ</h1>
          <SearchInput />
          <div className="hidden md:block">
            <AddRecipeButton />
          </div>
        </div>
      </header>
    </Container>
  );
}