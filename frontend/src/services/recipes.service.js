export default class RecipesService {
    static async getAllReceipts() {
        try {
            const response = await fetch('/recipes.json');
            if (!response.ok) throw new Error('Ошибка при загрузке рецептов');
            return await response.json();
        } catch (error) {
            console.error('Ошибка:', error);
            return [];
        }
    }

    static async getReceiptById(id) {
        try {
            const response = await fetch('/recipes.json');
            if (!response.ok) throw new Error('Ошибка при загрузке рецептов');
            const receipts = await response.json();
            return receipts.find(receipt => receipt.id === id);
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    }

    static async addReceipt(newReceipt) {
        try {
            const response = await fetch('/recipes.json');
            if (!response.ok) throw new Error('Ошибка при загрузке рецептов');
            const receipts = await response.json();
            const updatedReceipts = [...receipts, { ...newReceipt, id: receipts.length + 1 }];
            return updatedReceipts;
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    }

    static async getRecipesByAuthorId(authorId) {
        try {
            const response = await fetch('/recipes.json');
            if (!response.ok) throw new Error('Ошибка при загрузке рецептов');
            const recipes = await response.json();
            return recipes.filter(recipe => recipe.authorId === authorId);
        } catch (error) {
            console.error('Ошибка:', error);
            return [];
        }
    }
}