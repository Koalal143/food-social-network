import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/Container';

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center min-h-screen py-8">
      <div className="max-w-md text-center">
        <Image
          src="/images/error-404.png"
          alt="404 Error"
          width={400}
          height={300}
          className="mx-auto mb-8"
        />
        <h1 className="text-4xl font-bold mb-4">Страница не найдена</h1>
        <p className="text-lg text-muted-foreground mb-8">
          К сожалению, запрашиваемая вами страница не существует или была перемещена.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Вернуться на главную
        </Link>
      </div>
    </Container>
  );
} 