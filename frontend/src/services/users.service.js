export default class UsersService {
    static async getAllUsers() {
        try {
            const response = await fetch('/users.json');
            if (!response.ok) throw new Error('Ошибка при загрузке пользователей');
            const data = await response.json();
            console.log('Users loaded:', data);
            return data;
        } catch (error) {
            console.error('Ошибка:', error);
            return [];
        }
    }

    static async getUserById(id) {
        try {
            const response = await fetch('/users.json');
            if (!response.ok) throw new Error('Ошибка при загрузке пользователей');
            const users = await response.json();
            const user = users.find(user => user.id === id);
            console.log('User found:', user);
            return user;
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    }
} 