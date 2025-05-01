import Link from 'next/link';
import { Button } from './ui/button';
import Container from './Container';

const Header = () => {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-background border-b border-border py-4 z-50">
        <Container>
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-2xl font-bold">
                Food
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link href="/recipes" className="text-foreground hover:text-primary">
                  Рецепты
                </Link>
                <Link href="/favorites" className="text-foreground hover:text-primary">
                  Избранное
                </Link>
                <Link href="/special" className="text-foreground hover:text-primary">
                  Спецпроекты
                </Link>
                <Link href="/services" className="text-foreground hover:text-primary">
                  Полезные сервисы
                </Link>
                <Link href="/encyclopedia" className="text-foreground hover:text-primary">
                  Энциклопедия
                </Link>
              </div>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="outline">Войти</Button>
              <Link href="/add-recipe">
                <Button>Отправить рецепт</Button>
              </Link>
            </div>
          </div>
        </Container>
      </header>
      <div className="h-[72px]" /> {/* Компенсация фиксированного хедера */}
    </>
  );
};

export default Header;