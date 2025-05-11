import Link from "next/link";
import Container from "@/components/layout/Container";
import LoginForm from "@/components/shared/forms/LoginForm";
import EggBackground from "@/components/ui/EggBackground";

export default function LoginPage() {
  return (
    <>
      <EggBackground />
      <Container className="h-[calc(100vh-200px)] flex items-center justify-center relative">
        <div className="w-full max-w-md space-y-6 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold text-gray-900">Вход</h1>
            <p className="text-gray-600">Добро пожаловать в мир вкусных рецептов</p>
          </div>
          <LoginForm />
          <p className="text-center text-sm text-gray-600">
            Нет аккаунта?{" "}
            <Link href="/registration" className="text-orange-500 hover:text-orange-600 font-medium hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </Container>
    </>
  );
}