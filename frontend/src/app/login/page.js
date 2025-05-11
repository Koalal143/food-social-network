import Link from "next/link";
import Container from "@/components/layout/Container";
import LoginForm from "@/components/shared/forms/LoginForm";

export default function LoginPage() {
  return (
    <Container className="h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Вход</h1>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-gray-600">
          Нет аккаунта?{" "}
          <Link href="/registration" className="text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </Container>
  );
}