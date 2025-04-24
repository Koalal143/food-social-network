import Container from "./Container";

export default function Footer() {
    return (
      <footer className="bg-background border-t py-8">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">О нас</h3>
              <p className="text-muted-foreground">
                Мы - сообщество любителей кулинарии, делимся лучшими рецептами со всего мира.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Контакты</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>Email: info@recipesite.com</li>
                <li>Телефон: +7 (999) 123-45-67</li>
              </ul>
            </div>
          </div>
        </Container>
      </footer>
    );
  }