import { ERROR_MESSAGES } from "@/constants/errors";
import { NetworkError } from "@/utils/errors";

export default class S3Service {
    static async uploadImage(presignedPostData, file) {
        const formData = new FormData();
        
        Object.entries(presignedPostData.fields).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formData.append('Content-Type', 'image/png');
        formData.append('file', file);

        try {
            const response = await fetch(presignedPostData.url, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (errorData.error_key && ERROR_MESSAGES[errorData.error_key]) {
                    throw new Error(ERROR_MESSAGES[errorData.error_key]);
                } else {
                    throw new Error(errorData.detail || ERROR_MESSAGES.default);
                }
            }
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw new Error(ERROR_MESSAGES.file_upload_failed);
        }
    }
}