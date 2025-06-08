"use client"

import { useToast } from './use-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Расширенный хук для уведомлений с улучшенным UX
 */
export function useEnhancedToast() {
    const { toast } = useToast();

    const showToast = ({
        type = 'default',
        title,
        description,
        action,
        duration = 5000,
        persistent = false
    }) => {
        const getIcon = () => {
            switch (type) {
                case 'success':
                    return <CheckCircle className="w-5 h-5 text-green-600" />;
                case 'error':
                    return <AlertCircle className="w-5 h-5 text-red-600" />;
                case 'warning':
                    return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
                case 'info':
                    return <Info className="w-5 h-5 text-blue-600" />;
                default:
                    return null;
            }
        };

        const getVariant = () => {
            switch (type) {
                case 'error':
                    return 'destructive';
                default:
                    return 'default';
            }
        };

        return toast({
            title: (
                <div className="flex items-center space-x-2">
                    {getIcon()}
                    <span>{title}</span>
                </div>
            ),
            description,
            action,
            variant: getVariant(),
            duration: persistent ? Infinity : duration
        });
    };

    // Предустановленные типы уведомлений
    const success = (title, description, options = {}) => 
        showToast({ type: 'success', title, description, ...options });

    const error = (title, description, options = {}) => 
        showToast({ type: 'error', title, description, ...options });

    const warning = (title, description, options = {}) => 
        showToast({ type: 'warning', title, description, ...options });

    const info = (title, description, options = {}) => 
        showToast({ type: 'info', title, description, ...options });

    // Специальные уведомления
    const networkError = (retryAction) => 
        error(
            'Проблемы с подключением',
            'Проверьте интернет-соединение и попробуйте снова',
            {
                action: retryAction && (
                    <Button variant="outline" size="sm" onClick={retryAction}>
                        Повторить
                    </Button>
                ),
                persistent: true
            }
        );

    const saveSuccess = (undoAction) => 
        success(
            'Изменения сохранены',
            'Ваши данные успешно обновлены',
            {
                action: undoAction && (
                    <Button variant="outline" size="sm" onClick={undoAction}>
                        Отменить
                    </Button>
                )
            }
        );

    const deleteConfirm = (itemName, confirmAction) => 
        warning(
            'Подтвердите удаление',
            `Вы уверены, что хотите удалить "${itemName}"?`,
            {
                action: (
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => toast.dismiss()}>
                            Отмена
                        </Button>
                        <Button variant="destructive" size="sm" onClick={confirmAction}>
                            Удалить
                        </Button>
                    </div>
                ),
                persistent: true
            }
        );

    const uploadProgress = (progress, fileName) => 
        info(
            'Загрузка файла',
            `${fileName} - ${progress}%`,
            {
                duration: Infinity
            }
        );

    const formValidationError = (errors) => {
        const errorList = Array.isArray(errors) ? errors : [errors];
        return error(
            'Ошибки в форме',
            (
                <ul className="list-disc list-inside space-y-1">
                    {errorList.map((err, index) => (
                        <li key={index} className="text-sm">{err}</li>
                    ))}
                </ul>
            )
        );
    };

    const cookieConsent = (acceptAction, declineAction) => 
        info(
            'Использование cookies',
            'Мы используем файлы cookie для улучшения работы сайта',
            {
                action: (
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={declineAction}>
                            Отклонить
                        </Button>
                        <Button size="sm" onClick={acceptAction}>
                            Принять
                        </Button>
                    </div>
                ),
                persistent: true
            }
        );

    return {
        toast: showToast,
        success,
        error,
        warning,
        info,
        networkError,
        saveSuccess,
        deleteConfirm,
        uploadProgress,
        formValidationError,
        cookieConsent
    };
}
