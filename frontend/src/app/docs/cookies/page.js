"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/layout/Container";
import DocsNavigation from "@/components/docs/DocsNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CookieManager } from "@/utils/cookies";
import { useToast } from "@/hooks/use-toast";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Info, Shield, Settings, Database, BarChart3 } from "lucide-react";

export default function CookiesPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { revokeConsent } = useCookieConsent();
  const { logout } = useAuth();

  const handleDeleteAllCookies = async () => {
    setIsDeleting(true);
    try {
      // Отзываем согласие на куки
      revokeConsent();
      
      // Удаляем все куки-файлы
      CookieManager.clearAllCookies();
      
      // Выходим из системы если пользователь авторизован
      await logout();
      
      toast({
        title: "Куки-файлы удалены",
        description: "Все куки-файлы были успешно удалены. Вы будете перенаправлены на главную страницу.",
      });
      
      // Перенаправляем на главную страницу через небольшую задержку
      setTimeout(() => {
        router.push("/");
        // Перезагружаем страницу для полной очистки состояния
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error("Ошибка при удалении куки:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении куки-файлов. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const cookieTypes = [
    {
      icon: Shield,
      title: "Необходимые куки",
      description: "Обеспечивают базовую функциональность сайта",
      cookies: [
        { name: "access_token", purpose: "Аутентификация пользователя", duration: "30 минут" },
        { name: "refresh_token", purpose: "Обновление токена доступа", duration: "7 дней" }
      ]
    },
    {
      icon: Settings,
      title: "Функциональные куки",
      description: "Запоминают ваши предпочтения и настройки",
      cookies: [
        { name: "anonymous_user_id", purpose: "Идентификация для рекомендаций", duration: "1 год" },
        { name: "frontend_consent_accepted", purpose: "Состояние согласия на куки", duration: "1 год" }
      ]
    },
    {
      icon: BarChart3,
      title: "Аналитические куки",
      description: "Помогают улучшить работу сайта (только с вашего согласия)",
      cookies: [
        { name: "is_analytics_allowed", purpose: "Согласие на аналитику", duration: "1 год" }
      ]
    }
  ];

  return (
    <Container className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <DocsNavigation />
      
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <div className="flex items-center mb-6">
          <span className="text-3xl mr-3">🍪</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Управление куки-файлами
          </h1>
        </div>
        
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-700 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-blue-900 mb-2">Что такое куки-файлы?</h3>
                <p className="text-sm text-blue-800">
                  Куки-файлы — это небольшие текстовые файлы, которые сохраняются на вашем устройстве 
                  при посещении веб-сайта. Они помогают сайту запоминать ваши предпочтения и обеспечивать 
                  персонализированный опыт использования.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 text-gray-800">Типы куки-файлов, используемых на сайте</h2>
          
          <div className="space-y-4 mb-8">
            {cookieTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <Card key={index} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <Icon className="w-5 h-5 mr-2 text-gray-600" />
                      {type.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {type.cookies.map((cookie, cookieIndex) => (
                        <div key={cookieIndex} className="bg-gray-50 rounded-md p-3">
                          <div className="flex justify-between items-start mb-1">
                            <code className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">
                              {cookie.name}
                            </code>
                            <span className="text-xs text-gray-500">{cookie.duration}</span>
                          </div>
                          <p className="text-sm text-gray-600">{cookie.purpose}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Удаление всех куки-файлов
            </h3>
            <div className="space-y-3 text-sm text-red-800">
              <p>
                <strong>Внимание:</strong> Удаление всех куки-файлов приведет к следующим последствиям:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Вы будете автоматически выведены из системы</li>
                <li>Все ваши настройки и предпочтения будут сброшены</li>
                <li>Рекомендации станут менее персонализированными</li>
                <li>Потребуется повторное согласие на использование куки</li>
              </ul>
              <p className="font-medium">
                Это действие нельзя отменить. Продолжить?
              </p>
            </div>
            
            <div className="mt-4">
              <Button
                onClick={handleDeleteAllCookies}
                disabled={isDeleting}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Удаление..." : "Удалить все куки-файлы"}
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Управление куки в браузере</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Вы также можете управлять куки-файлами через настройки вашего браузера:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Chrome:</strong> Настройки → Конфиденциальность и безопасность → Файлы cookie</li>
                <li><strong>Firefox:</strong> Настройки → Приватность и защита → Куки и данные сайтов</li>
                <li><strong>Safari:</strong> Настройки → Конфиденциальность → Управление данными веб-сайта</li>
                <li><strong>Edge:</strong> Настройки → Файлы cookie и разрешения сайта</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
