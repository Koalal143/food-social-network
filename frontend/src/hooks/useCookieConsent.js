import { useEffect, useState } from 'react';
import { CookieManager } from '@/utils/cookies';

/**
 * Хук для управления состоянием согласия на cookies
 * Автоматически восстанавливает состояние при загрузке приложения
 */
export function useCookieConsent() {
    const [hasConsent, setHasConsent] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Проверяем согласие при загрузке компонента
        const checkConsent = () => {
            try {
                const consent = CookieManager.hasConsentForCookies();
                setHasConsent(consent);

                // Логируем информацию для отладки
                if (consent) {
                    const timestamp = CookieManager.getConsentTimestamp();
                    if (timestamp) {
                        console.log('Cookie consent restored from:', new Date(timestamp));
                    }
                }
            } catch (error) {
                console.error('Error checking cookie consent:', error);
                setHasConsent(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkConsent();

        // Слушаем изменения в localStorage для синхронизации между вкладками
        // Проверяем наличие window для SSR безопасности
        if (typeof window !== 'undefined') {
            const handleStorageChange = (e) => {
                if (e.key === 'cookie_consent_accepted') {
                    const newConsent = e.newValue === '1';
                    setHasConsent(newConsent);
                }
            };

            window.addEventListener('storage', handleStorageChange);

            return () => {
                window.removeEventListener('storage', handleStorageChange);
            };
        }
    }, []);

    /**
     * Установить согласие на использование cookies
     * @param {boolean} consent - согласие пользователя
     */
    const setConsent = (consent) => {
        try {
            CookieManager.setConsentForCookies(consent);
            setHasConsent(consent);
        } catch (error) {
            console.error('Error setting cookie consent:', error);
        }
    };

    /**
     * Отозвать согласие на использование cookies
     */
    const revokeConsent = () => {
        setConsent(false);
    };

    // Безопасно получаем timestamp для SSR
    const getConsentTimestamp = () => {
        try {
            return CookieManager.getConsentTimestamp();
        } catch (error) {
            return null;
        }
    };

    return {
        hasConsent,
        isLoading,
        setConsent,
        revokeConsent,
        consentTimestamp: getConsentTimestamp()
    };
}
