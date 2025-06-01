import { BASE_API } from "@/constants/backend-urls"
import { tokenManager } from "@/utils/tokenManager"
import AuthService from "./auth.service";

export default class SearchHistoryService {
    static async getLastFiveSearches() {
        await tokenManager.ensureValidToken();

        const accessToken = AuthService.getAccessToken();

        const headers = {
            'Content-Type': 'application/json'
        };

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${BASE_API}/v1/recipes/search/history?limit=5`, {
            headers: headers
        })
        if (!response.ok) {
            throw new Error('Failed to fetch last five searches')
        }
        return response.json()
    }

    static async addSearch(search) {
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
            body: JSON.stringify(search),
            headers: headers
        })

        if (!response.ok) {
            throw new Error('Failed to add search')
        }

        return response.json()
    }
}