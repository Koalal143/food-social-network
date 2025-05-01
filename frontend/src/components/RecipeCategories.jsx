import Link from 'next/link';
import Container from './Container';

const categories = [
  { name: 'Завтрак', href: '/category/breakfast' },
  { name: 'Обед', href: '/category/lunch' },
  { name: 'Ужин', href: '/category/dinner' },
  { name: 'Здоровая еда', href: '/category/healthy' },
  { name: 'Закуски', href: '/category/appetizers' },
  { name: 'Десерты', href: '/category/desserts' },
];

const RecipeCategories = () => {
  return (
    <section className="py-8 bg-card">
      <Container>
        <h2 className="text-2xl font-bold mb-6">Приготовить сегодня</h2>
        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="px-4 py-2 bg-background rounded-full border border-border hover:bg-primary transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default RecipeCategories; 