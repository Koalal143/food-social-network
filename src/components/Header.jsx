import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground">
        <div className="py-2 flex items-center justify-between pl-10 pr-10">
          <h1 className="text-lg font-bold">САЙТ С РЕЦЕПТАМИ</h1>
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск рецептов..."
                className="pl-10 w-full bg-white text-black"
              />
            </div>
          </div>
          <Button variant="secondary" size="sm">
            Добавить рецепт
          </Button>
        </div>
    </header>
  );
}