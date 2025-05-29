"use client"

import Container from "@/components/layout/Container"
import DeleteRecipeTest from "@/components/debug/DeleteRecipeTest"

export default function DeleteRecipeTestPage() {
    return (
        <Container>
            <div className="py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">🔧 Диагностика удаления рецептов</h1>
                        <p className="text-muted-foreground">
                            Эта страница доступна только в режиме разработки для тестирования функциональности удаления рецептов.
                        </p>
                    </div>
                    
                    <DeleteRecipeTest />
                    
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h2 className="font-semibold text-yellow-800 mb-2">⚠️ Предупреждение</h2>
                        <p className="text-yellow-700 text-sm">
                            Эта страница предназначена только для разработки и отладки. 
                            Тестовое удаление фактически удалит рецепт из базы данных!
                        </p>
                    </div>
                </div>
            </div>
        </Container>
    )
}
