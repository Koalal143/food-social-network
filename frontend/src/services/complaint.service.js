import { BASE_API } from "@/constants/backend-urls";
import { tokenManager } from "@/utils/tokenManager";
import AuthService from "./auth.service";
import { AuthError, NetworkError } from "@/utils/errors";
import { ERROR_MESSAGES } from "@/constants/errors";

export default class ComplaintService {
    static async getAllComplaints(offset = 0, limit = 10, searchQuery = '', statusFilter = 'all') {
        try {
            const url = new URL(`${BASE_API}/v1/complaints`);
            url.searchParams.append('offset', offset.toString());
            url.searchParams.append('limit', limit.toString());
            if (searchQuery) {
                url.searchParams.append('q', searchQuery);
            }
            if (statusFilter !== 'all') {
                url.searchParams.append('status', statusFilter);
            }

            await tokenManager.ensureValidToken();
            const accessToken = AuthService.getAccessToken();
            if (!accessToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }

            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new NetworkError(errorData.detail || ERROR_MESSAGES.network_error, response.status, errorData.error_key);
            }

            const totalCount = parseInt(response.headers.get('X-Total-Count') || '0', 10);
            const data = await response.json();

            return { data, totalCount };
        } catch (error) {
            console.error("ComplaintService.getAllComplaints: ", error);
            throw error;
        }
    }

    static async resolveComplaint(complaintId) {
        try {
            await tokenManager.ensureValidToken();
            const accessToken = AuthService.getAccessToken();
            if (!accessToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }

            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`${BASE_API}/v1/complaints/${complaintId}/resolve`, {
                method: 'PATCH',
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new NetworkError(errorData.detail || ERROR_MESSAGES.network_error, response.status, errorData.error_key);
            }

            return response.json();
        } catch (error) {
            console.error("ComplaintService.resolveComplaint: ", error);
            throw error;
        }
    }

    static async rejectComplaint(complaintId) {
        try {
            await tokenManager.ensureValidToken();
            const accessToken = AuthService.getAccessToken();
            if (!accessToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }

            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`${BASE_API}/v1/complaints/${complaintId}/reject`, {
                method: 'PATCH',
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new NetworkError(errorData.detail || ERROR_MESSAGES.network_error, response.status, errorData.error_key);
            }

            return response.json();
        } catch (error) {
            console.error("ComplaintService.rejectComplaint: ", error);
            throw error;
        }
    }

    
    static async banUserAndResolveComplaint(userId, complaintId) {
        try {
            
            console.log(`Имитация: Пользователь ${userId} заблокирован, жалоба ${complaintId} разрешена.`);
            return { success: true };
        } catch (error) {
            console.error("ComplaintService.banUserAndResolveComplaint: ", error);
            throw error;
        }
    }

    static async banRecipeAndResolveComplaint(recipeId, complaintId) {
        try {
           
            
            console.log(`Имитация: Рецепт ${recipeId} заблокирован, жалоба ${complaintId} разрешена.`);
            return { success: true };
        } catch (error) {
            console.error("ComplaintService.banRecipeAndResolveComplaint: ", error);
            throw error;
        }
    }
} 