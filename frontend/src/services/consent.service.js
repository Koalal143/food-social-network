import { BASE_API } from "@/constants/backend-urls";

export default class ConsentService {
    static async sendConsent(is_analytics_allowed) {
        try {
            const response = await fetch(`${BASE_API}/v1/consent`, {
                method: 'POST',
                body: JSON.stringify({'is_analytics_allowed': is_analytics_allowed}),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || ERROR_MESSAGES.internal_server_error);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }
}