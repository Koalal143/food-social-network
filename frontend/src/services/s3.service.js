export default class S3Service {
    static async uploadImage(presignedPostData, file) {
        console.log(presignedPostData, file);
        
        const formData = new FormData();
        
        formData.append('acl', 'private');
        
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
                // Обработка ошибок бэка
            }
        } catch (error) {
            console.error('Upload failed:', error);
            throw new Error('Image upload failed');
        }
    }
}