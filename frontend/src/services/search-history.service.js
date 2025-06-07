import { BASE_API } from "@/constants/backend-urls"
import { tokenManager } from "@/utils/tokenManager"
import AuthService from "./auth.service";

const LOCALSTORAGE_KEY = "cookie_consent_accepted";

export default class SearchHistoryService {
    // Проверка согласия на куки
    static hasConsentForCookies() {
        const consent = localStorage.getItem(LOCALSTORAGE_KEY);
        return consent === '1';
    }
    static async getLastFiveSearches() {
        // Проверяем согласие на куки перед запросом
        if (!this.hasConsentForCookies()) {
            console.log('Загрузка истории поиска пропущена: нет согласия на использование куки');
            return [];
        }

        await tokenManager.ensureValidToken();

        const accessToken = AuthService.getAccessToken();

        const headers = {
            'Content-Type': 'application/json'
        };

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${BASE_API}/v1/recipes/search/history?limit=5`, {
            headers: headers,
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error('Failed to fetch last five searches')
        }
        return response.json()
    }

    static async addSearch(search) {
        // Проверяем согласие на куки перед сохранением
        if (!this.hasConsentForCookies()) {
            console.log('Сохранение поискового запроса пропущено: нет согласия на использование куки');
            return { saved: false, reason: 'no_consent' };
        }

        await tokenManager.ensureValidToken();

        const accessToken = AuthService.getAccessToken();

        const headers = {
            'Content-Type': 'application/json'
        };

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${BASE_API}/v1/recipes/search/history`, {
            method: 'POST',
            body: JSON.stringify({'query': search}),
            headers: headers,
            credentials: 'include'
        })

        if (!response.ok) {
            throw new Error('Failed to add search')
        }

        return response.json()
    }
}