"use client"

import Link from "next/link";
import Container from "@/components/layout/Container";
import RegistrationForm from "@/components/shared/forms/RegistrationForm";
import EggBackground from "@/components/ui/EggBackground";

export default function RegistrationPage() {
  return (
    <>
      <EggBackground />
      <Container className="h-[calc(100vh-200px)] flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-md space-y-6 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Регистрация</h1>
          </div>
          <RegistrationForm />
          <p className="text-center text-sm text-gray-600">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </Container>
    </>
  );
}