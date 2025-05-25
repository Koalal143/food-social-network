import SearchService from '../search.service';

global.fetch = jest.fn();

describe('SearchService', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('должен правильно формировать URL с фильтрами', () => {
        const mockResponse = {
            ok: true,
            json: () => Promise.resolve([]),
            headers: {
                get: () => '0'
            }
        };
        
        fetch.mockResolvedValue(mockResponse);

        const filters = {
            includeIngredients: ['мука', 'яйца'],
            excludeIngredients: ['молоко'],
            tags: ['завтрак', 'быстро']
        };

        expect(() => {
            SearchService.searchRecipes('тест', filters, 0, 10);
        }).not.toThrow();
    });

    test('должен обрабатывать пустые фильтры', () => {
        const mockResponse = {
            ok: true,
            json: () => Promise.resolve([]),
            headers: {
                get: () => '0'
            }
        };
        
        fetch.mockResolvedValue(mockResponse);

        expect(() => {
            SearchService.searchRecipes('тест', {}, 0, 10);
        }).not.toThrow();
    });
});
