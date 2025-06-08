import Link from "next/link";
import Container from "@/components/layout/Container";
import LoginForm from "@/components/shared/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-chart-4/10 flex items-center justify-center py-12 px-4">
        <Container className="flex items-center justify-center">
            <div className="w-full max-w-md space-y-6 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-200/50 glass-header">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 font-main">Вход</h1>
                    <p className="text-gray-600">Добро пожаловать в мир вкусных рецептов</p>
                </div>
                <LoginForm />
                <div className='text-center text-sm text-gray-500'>
                    Нажимая на кнопку, вы даете согласие на <a className="text-primary hover:text-primary/80 hover:underline transition-colors" href='/docs/policy'>обработку персональных данных</a> и <a className="text-primary hover:text-primary/80 hover:underline transition-colors" href='/docs/recommendations-policy'>использование рекомендательных систем</a>.
                </div>
                <p className="text-center text-sm text-gray-600">
                    Нет аккаунта?{" "}
                    <Link href="/registration" className="text-orange-500 hover:text-orange-600 font-medium hover:underline transition-colors">
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
        </Container>
    </div>
  );
}