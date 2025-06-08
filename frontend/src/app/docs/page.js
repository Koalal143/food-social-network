import Container from "@/components/layout/Container";
import DocsNavigation from "@/components/docs/DocsNavigation";
import { FileText, Shield, Settings, Cookie } from "lucide-react";

export default function DocsPage() {
  return (
    <Container className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <DocsNavigation />
      
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FileText className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Документы и политики
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Здесь вы найдете всю важную информацию о том, как мы обрабатываем ваши данные, 
            работают наши рекомендательные системы и как управлять настройками конфиденциальности.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start">
              <Shield className="w-8 h-8 text-blue-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Политика конфиденциальности
                </h3>
                <p className="text-gray-600 mb-4">
                  Подробная информация о том, как мы собираем, используем и защищаем ваши персональные данные. 
                  Узнайте о ваших правах и наших обязательствах по обработке данных.
                </p>
                <a 
                  href="/docs/policy" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  Читать полностью →
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start">
              <Settings className="w-8 h-8 text-green-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Политика рекомендательных систем
                </h3>
                <p className="text-gray-600 mb-4">
                  Принципы работы наших алгоритмов рекомендаций. Узнайте, как мы подбираем рецепты 
                  специально для вас и как можете влиять на качество рекомендаций.
                </p>
                <a 
                  href="/docs/recommendations-policy" 
                  className="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
                >
                  Читать полностью →
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start">
              <Cookie className="w-8 h-8 text-orange-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Управление куки-файлами
                </h3>
                <p className="text-gray-600 mb-4">
                  Настройте использование куки-файлов на нашем сайте. Управляйте согласиями 
                  и узнайте, какие данные мы сохраняем для улучшения вашего опыта.
                </p>
                <a 
                  href="/docs/cookies" 
                  className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium"
                >
                  Управлять настройками →
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                Важная информация
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Все документы регулярно обновляются в соответствии с изменениями в законодательстве 
                и развитием нашего сервиса. Рекомендуем периодически проверять актуальные версии.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            По вопросам обработки данных: <a href="mailto:onton5447@gmail.com" className="text-blue-600 hover:underline">onton5447@gmail.com</a>
          </p>
        </div>
      </div>
    </Container>
  );
}
