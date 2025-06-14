"use client"

import Link from "next/link";
import Container from "@/components/layout/Container";
import RegistrationForm from "@/components/shared/forms/RegistrationForm";

export default function RegisterPage() {
  return (
    <div className="h-screen bg-gradient-to-br from-background via-secondary/20 to-muted/40 flex items-center justify-center p-4 overflow-hidden">
        <Container className="flex items-center justify-center h-full">
            <div className="w-full max-w-sm space-y-3 bg-white/20 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-2xl border border-white/30 relative overflow-y-auto max-h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl"></div>
                <div className="relative z-10">
                    <div className="space-y-1 text-center mb-4">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-main">Регистрация</h1>
                        <p className="text-sm text-gray-600">Присоединяйтесь к сообществу любителей кулинарии</p>
                    </div>
                    <RegistrationForm />
                    <div className='text-center text-xs text-gray-500 mt-3'>
                        Нажимая на кнопку, вы даете согласие на <a className="text-primary hover:text-primary/80 hover:underline transition-colors" href='/docs/policy'>обработку персональных данных</a> и <a className="text-primary hover:text-primary/80 hover:underline transition-colors" href='/docs/recommendations-policy'>использование рекомендательных систем</a>.
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-3">
                        Уже есть аккаунт?{" "}
                        <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors">
                            Войти
                        </Link>
                    </p>
                </div>
            </div>
        </Container>
    </div>
  );
}
