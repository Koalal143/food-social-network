"use client"

import Link from "next/link";
import Container from "@/components/layout/Container";
import RegistrationForm from "@/components/shared/forms/RegistrationForm";

export default function RegistrationPage() {
  return (
    <Container className="h-[calc(100vh-200px)] flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Регистрация</h1>
        </div>
        <RegistrationForm />
        <p className="text-center text-sm text-gray-600">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </Container>
  );
}