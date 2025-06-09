
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
    Wifi, 
    WifiOff, 
    RefreshCw, 
    CheckCircle, 
    AlertCircle,
    Cloud,
    CloudOff
} from 'lucide-react'
import ShoppingListService from '@/services/shopping-list.service'

export default function SyncStatusIndicator({ onSyncComplete }) {
    const { toast } = useToast()
    const [isOnline, setIsOnline] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [offlineStats, setOfflineStats] = useState(null)

    useEffect(() => {
        setIsOnline(navigator.onLine)
        updateOfflineStats()

        const handleOnline = () => {
            setIsOnline(true)
            updateOfflineStats()
            handleAutoSync()
        }

        const handleOffline = () => {
            setIsOnline(false)
            updateOfflineStats()
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        const interval = setInterval(updateOfflineStats, 30000)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            clearInterval(interval)
        }
    }, [])

    const updateOfflineStats = () => {
        const stats = ShoppingListService.getOfflineStats()
        setOfflineStats(stats)
    }

    const handleAutoSync = async () => {
        if (!isOnline) return

        try {
            setIsSyncing(true)
            const result = await ShoppingListService.syncOfflineOperations()
            
            if (result.success && result.syncedCount > 0) {
                toast({
                    variant: "default",
                    title: "Синхронизация завершена",
                    description: `Синхронизировано ${result.syncedCount} операций`,
                })
                onSyncComplete && onSyncComplete()
            }
            
            if (result.errors && result.errors.length > 0) {
                toast({
                    variant: "destructive",
                    title: "Ошибки синхронизации",
                    description: `${result.errors.length} операций не удалось синхронизировать`,
                })
            }
        } catch (error) {
            console.error('Ошибка автоматической синхронизации:', error)
        } finally {
            setIsSyncing(false)
            updateOfflineStats()
        }
    }

    const handleManualSync = async () => {
        if (!isOnline) {
            toast({
                variant: "destructive",
                title: "Нет подключения",
                description: "Синхронизация недоступна без подключения к интернету",
            })
            return
        }

        try {
            setIsSyncing(true)
            const result = await ShoppingListService.syncOfflineOperations()
            
            if (result.success) {
                if (result.syncedCount > 0) {
                    toast({
                        variant: "default",
                        title: "Синхронизация завершена",
                        description: `Синхронизировано ${result.syncedCount} операций`,
                    })
                } else {
                    toast({
                        variant: "default",
                        title: "Синхронизация не требуется",
                        description: "Все данные уже синхронизированы",
                    })
                }
                onSyncComplete && onSyncComplete()
            } else {
                toast({
                    variant: "destructive",
                    title: "Ошибка синхронизации",
                    description: result.error || "Не удалось синхронизировать данные",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка синхронизации",
                description: "Произошла ошибка при синхронизации данных",
            })
        } finally {
            setIsSyncing(false)
            updateOfflineStats()
        }
    }

    const handleForceRefresh = async () => {
        if (!isOnline) {
            toast({
                variant: "destructive",
                title: "Нет подключения",
                description: "Обновление недоступно без подключения к интернету",
            })
            return
        }

        try {
            setIsSyncing(true)
            await ShoppingListService.forceRefreshFromServer()
            
            toast({
                variant: "default",
                title: "Данные обновлены",
                description: "Список покупок обновлен с сервера",
            })
            onSyncComplete && onSyncComplete()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка обновления",
                description: "Не удалось обновить данные с сервера",
            })
        } finally {
            setIsSyncing(false)
        }
    }

    if (!offlineStats) return null

    const hasOfflineOperations = offlineStats.queueLength > 0
    const showSyncButton = isOnline && hasOfflineOperations

    return (
        <div className="flex items-center gap-2">
            {/* Индикатор состояния сети */}
            <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? "Online" : "Offline"}
            </Badge>

            {/* Индикатор offline операций */}
            {hasOfflineOperations && (
                <Badge variant="secondary" className="flex items-center gap-1">
                    <CloudOff className="w-3 h-3" />
                    {offlineStats.queueLength} не синхр.
                </Badge>
            )}

            {/* Кнопка синхронизации */}
            {showSyncButton && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="flex items-center gap-1"
                >
                    {isSyncing ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                        <Cloud className="w-3 h-3" />
                    )}
                    Синхронизировать
                </Button>
            )}

            {/* Кнопка принудительного обновления */}
            {isOnline && !hasOfflineOperations && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleForceRefresh}
                    disabled={isSyncing}
                    className="flex items-center gap-1"
                >
                    {isSyncing ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                        <RefreshCw className="w-3 h-3" />
                    )}
                    Обновить
                </Button>
            )}

            {/* Индикатор успешной синхронизации */}
            {isOnline && !hasOfflineOperations && !isSyncing && (
                <Badge variant="outline" className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    Синхронизировано
                </Badge>
            )}
        </div>
    )
}
