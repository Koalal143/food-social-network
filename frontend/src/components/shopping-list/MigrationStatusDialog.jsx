
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Database,
    Cloud,
    ArrowRight
} from 'lucide-react'
import ShoppingListService from '@/services/shopping-list.service'
import ShoppingListMigration from '@/services/utils/shopping-list-migration'

export default function MigrationStatusDialog({ isOpen, onClose, onMigrationComplete }) {
    const { toast } = useToast()
    const [migrationStatus, setMigrationStatus] = useState(null)
    const [isMigrating, setIsMigrating] = useState(false)
    const [localDataCount, setLocalDataCount] = useState(0)

    useEffect(() => {
        if (isOpen) {
            checkMigrationStatus()
        }
    }, [isOpen])

    const checkMigrationStatus = () => {
        const status = ShoppingListService.getMigrationStatus()
        const localData = ShoppingListMigration.getLocalStorageData()
        
        setMigrationStatus(status)
        setLocalDataCount(localData.length)
    }

    const handleMigration = async () => {
        try {
            setIsMigrating(true)
            
            const result = await ShoppingListMigration.migrateToBackend()
            
            if (result.success) {
                toast({
                    variant: "default",
                    title: "Миграция завершена",
                    description: `Успешно перенесено ${result.migratedCount} элементов`,
                })
                
                if (result.migratedCount > 0) {
                    ShoppingListMigration.clearLocalStorageData()
                }
                
                onMigrationComplete && onMigrationComplete()
                onClose()
            } else {
                toast({
                    variant: "destructive",
                    title: "Ошибка миграции",
                    description: `Перенесено ${result.migratedCount} из ${localDataCount} элементов`,
                })
            }
            
            if (result.errors.length > 0) {
                console.error('Ошибки миграции:', result.errors)
            }
        } catch (error) {
            console.error('Критическая ошибка миграции:', error)
            toast({
                variant: "destructive",
                title: "Критическая ошибка",
                description: "Не удалось выполнить миграцию данных",
            })
        } finally {
            setIsMigrating(false)
            checkMigrationStatus()
        }
    }

    const handleSkipMigration = () => {
        ShoppingListMigration.markAsMigrated()
        
        toast({
            variant: "default",
            title: "Миграция пропущена",
            description: "Локальные данные сохранены, миграция не выполнена",
        })
        
        onClose()
    }

    if (!migrationStatus) return null

    const needsMigration = !migrationStatus.migrated && localDataCount > 0

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {needsMigration ? (
                            <>
                                <Database className="w-5 h-5 text-blue-500" />
                                Миграция данных
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Статус миграции
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {needsMigration ? (
                            <>
                                Обнаружены локальные данные списка покупок. 
                                Хотите перенести их на сервер для синхронизации между устройствами?
                            </>
                        ) : (
                            <>
                                {migrationStatus.migrated ? (
                                    `Миграция была выполнена ${new Date(migrationStatus.date).toLocaleDateString()}`
                                ) : (
                                    'Локальные данные не обнаружены'
                                )}
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {needsMigration && (
                    <div className="space-y-4">
                        {/* Информация о данных */}
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">Локальные данные</span>
                            </div>
                            <Badge variant="secondary">
                                {localDataCount} элементов
                            </Badge>
                        </div>

                        {/* Процесс миграции */}
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Database className="w-4 h-4" />
                            <ArrowRight className="w-4 h-4" />
                            <Cloud className="w-4 h-4" />
                            <span>localStorage → Сервер</span>
                        </div>

                        {/* Предупреждение */}
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-yellow-800">
                                <p className="font-medium mb-1">Важная информация:</p>
                                <ul className="space-y-1">
                                    <li>• После миграции данные будут синхронизироваться между устройствами</li>
                                    <li>• Локальные данные будут удалены после успешного переноса</li>
                                    <li>• Вы можете пропустить миграцию и продолжить работу с локальными данными</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {needsMigration ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleSkipMigration}
                                disabled={isMigrating}
                            >
                                Пропустить
                            </Button>
                            <Button
                                onClick={handleMigration}
                                disabled={isMigrating}
                                className="flex items-center gap-2"
                            >
                                {isMigrating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Миграция...
                                    </>
                                ) : (
                                    <>
                                        <Cloud className="w-4 h-4" />
                                        Перенести на сервер
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={onClose}>
                            Закрыть
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
