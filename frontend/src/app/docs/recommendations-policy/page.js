import Container from "@/components/layout/Container";
import DocsNavigation from "@/components/docs/DocsNavigation";

export default function RecommendationsPolicyPage() {
  return (
    <Container className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <DocsNavigation />
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
          Политика рекомендательных систем
        </h1>
        
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-700">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">1. Общие положения</h2>
            <div className="space-y-3">
              <p><strong>1.1.</strong> Настоящая Политика рекомендательных систем (далее — Политика) определяет принципы работы алгоритмов рекомендаций на платформе ВкуСвайп (далее — Платформа).</p>
              <p><strong>1.2.</strong> Политика разработана в соответствии с требованиями Федерального закона от 30.12.2020 № 530-ФЗ «О внесении изменений в Федеральный закон "Об информации, информационных технологиях и о защите информации"».</p>
              <p><strong>1.3.</strong> Рекомендательная система — это алгоритм, который анализирует поведение пользователей и предлагает персонализированный контент (рецепты) на основе их предпочтений и интересов.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">2. Цели использования рекомендательных систем</h2>
            <ul className="list-decimal pl-4 sm:pl-6 space-y-2">
              <li>Персонализация пользовательского опыта и повышение релевантности контента</li>
              <li>Помощь пользователям в поиске интересных и подходящих рецептов</li>
              <li>Улучшение навигации по платформе и обнаружение нового контента</li>
              <li>Повышение вовлеченности пользователей и качества взаимодействия с платформой</li>
              <li>Поддержка авторов контента через продвижение их рецептов целевой аудитории</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">3. Принципы работы рекомендательной системы</h2>
            <div className="space-y-4">
              <p><strong>3.1.</strong> <u>Алгоритм MMR (Maximal Marginal Relevance)</u> — основной алгоритм, обеспечивающий баланс между релевантностью и разнообразием рекомендаций.</p>
              
              <p><strong>3.2.</strong> <u>Векторные представления</u> — рецепты преобразуются в числовые векторы с помощью технологий машинного обучения для анализа схожести.</p>
              
              <p><strong>3.3.</strong> <u>Коллаборативная фильтрация</u> — анализ поведения похожих пользователей для формирования рекомендаций.</p>
              
              <p><strong>3.4.</strong> <u>Контентная фильтрация</u> — анализ характеристик рецептов (ингредиенты, теги, сложность) для поиска похожего контента.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">4. Данные, используемые для рекомендаций</h2>
            <div className="space-y-4">
              <p><strong>4.1.</strong> Для формирования рекомендаций используются следующие данные:</p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 border-b font-semibold text-left">Тип данных</th>
                      <th className="px-2 sm:px-4 py-2 border-b font-semibold text-left">Описание</th>
                      <th className="px-2 sm:px-4 py-2 border-b font-semibold text-left">Цель использования</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-2 sm:px-4 py-2 border-b font-medium">Лайки и дизлайки</td>
                      <td className="px-2 sm:px-4 py-2 border-b">Реакции пользователей на рецепты</td>
                      <td className="px-2 sm:px-4 py-2 border-b">Определение предпочтений пользователя</td>
                    </tr>
                    <tr>
                      <td className="px-2 sm:px-4 py-2 border-b font-medium">Избранные рецепты</td>
                      <td className="px-2 sm:px-4 py-2 border-b">Рецепты, добавленные в избранное</td>
                      <td className="px-2 sm:px-4 py-2 border-b">Анализ долгосрочных интересов</td>
                    </tr>
                    <tr>
                      <td className="px-2 sm:px-4 py-2 border-b font-medium">Поисковые запросы</td>
                      <td className="px-2 sm:px-4 py-2 border-b">История поиска пользователя</td>
                      <td className="px-2 sm:px-4 py-2 border-b">Понимание текущих потребностей</td>
                    </tr>
                    <tr>
                      <td className="px-2 sm:px-4 py-2 border-b font-medium">Время взаимодействия</td>
                      <td className="px-2 sm:px-4 py-2 border-b">Время просмотра рецептов</td>
                      <td className="px-2 sm:px-4 py-2 border-b">Оценка заинтересованности</td>
                    </tr>
                    <tr>
                      <td className="px-2 sm:px-4 py-2 border-b font-medium">Характеристики рецептов</td>
                      <td className="px-2 sm:px-4 py-2 border-b">Ингредиенты, теги, сложность, время приготовления</td>
                      <td className="px-2 sm:px-4 py-2 border-b">Контентная фильтрация</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p><strong>4.2.</strong> Все данные обрабатываются в соответствии с <a href="/docs/policy" className="text-blue-600 hover:underline">Политикой конфиденциальности</a>.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">5. Технические особенности алгоритма</h2>
            <div className="space-y-4">
              <p><strong>5.1.</strong> <u>Векторная база данных Qdrant</u> — используется для хранения и быстрого поиска похожих рецептов.</p>
              
              <p><strong>5.2.</strong> <u>Эмбеддинги GigaChat</u> — рецепты преобразуются в векторные представления с помощью языковой модели GigaChat.</p>
              
              <p><strong>5.3.</strong> <u>Параметры алгоритма MMR</u>:</p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1">
                <li>λ (лямбда) = 0.7 — баланс между релевантностью и разнообразием</li>
                <li>Максимальное количество рекомендаций за запрос: 50</li>
                <li>Минимальный порог схожести: 0.3</li>
                <li>Обновление модели: каждые 24 часа</li>
              </ul>
              </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">6. Права пользователей</h2>
            <div className="space-y-3">
              <p><strong>6.1.</strong> Пользователи имеют право:</p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-2">
                <li>Получать информацию о принципах работы рекомендательной системы</li>
                <li>Влиять на рекомендации через лайки, дизлайки и добавление в избранное</li>
                <li>Очистить историю взаимодействий для сброса персонализации</li>
                <li>Отключить персонализированные рекомендации (будут показываться популярные рецепты)</li>
                <li>Запросить объяснение, почему был рекомендован конкретный рецепт</li>
              </ul>
              
              <p><strong>6.2.</strong> Для управления настройками рекомендаций обратитесь в службу поддержки: <a href="mailto:onton5447@gmail.com" className="text-blue-600 hover:underline">onton5447@gmail.com</a></p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">7. Ограничения и меры безопасности</h2>
            <div className="space-y-3">
              <p><strong>7.1.</strong> Рекомендательная система не используется для:</p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1">
                <li>Дискриминации пользователей по любым признакам</li>
                <li>Манипулирования общественным мнением</li>
                <li>Продвижения вредного или опасного контента</li>
                <li>Нарушения авторских прав</li>
              </ul>

              <p><strong>7.2.</strong> Меры безопасности:</p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1">
                <li>Модерация контента перед включением в рекомендации</li>
                <li>Фильтрация неподходящего контента</li>
                <li>Регулярный аудит алгоритмов на предмет справедливости</li>
                <li>Защита от спама и накрутки взаимодействий</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">8. Прозрачность и подотчетность</h2>
            <div className="space-y-3">
              <p><strong>8.1.</strong> Мы стремимся к максимальной прозрачности работы рекомендательных систем.</p>
              
              <p><strong>8.2.</strong> Пользователи могут получить объяснение рекомендаций в виде:</p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1">
                <li>"Рекомендовано на основе ваших лайков рецептов с тегом 'десерты'"</li>
                <li>"Похоже на рецепты, которые вы добавляли в избранное"</li>
                <li>"Популярно среди пользователей с похожими интересами"</li>
              </ul>
              
              <p><strong>8.3.</strong> Регулярные отчеты о работе системы публикуются в разделе "Статистика" (при наличии).</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">9. Обновления и изменения</h2>
            <div className="space-y-3">
              <p><strong>9.1.</strong> Алгоритмы рекомендаций могут обновляться для улучшения качества сервиса.</p>
              <p><strong>9.2.</strong> О существенных изменениях в работе рекомендательной системы пользователи уведомляются заранее.</p>
              <p><strong>9.3.</strong> Актуальная версия Политики всегда доступна по адресу: <a href="https://vkuswipe.ru/docs/recommendations-policy" className="text-blue-600 hover:underline">https://vkuswipe.ru/docs/recommendations-policy</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">10. Контактная информация</h2>
            <div className="space-y-3">
              <p><strong>10.1.</strong> По вопросам работы рекомендательных систем обращайтесь:</p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1">
                <li>Email: <a href="mailto:onton5447@gmail.com" className="text-blue-600 hover:underline">onton5447@gmail.com</a></li>
                <li>Тема письма: "Рекомендательные системы"</li>
              </ul>
              
              <p><strong>10.2.</strong> Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}</p>
            </div>
          </section>
        </div>
      </div>
    </Container>
  )
}
