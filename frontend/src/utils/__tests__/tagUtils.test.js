import { 
    separateTagsAndMethods, 
    combineTagsAndMethods, 
    isCookingMethod, 
    getCleanTagName,
    filterTagsByType 
} from '../tagUtils';

describe('tagUtils', () => {
    describe('separateTagsAndMethods', () => {
        test('должен правильно разделять теги и методы приготовления', () => {
            const tags = [
                { name: 'Завтрак' },
                { name: 'method:Варка' },
                { name: 'Итальянская кухня' },
                { name: 'method:Жарка' }
            ];

            const result = separateTagsAndMethods(tags);

            expect(result.tags).toEqual(['Завтрак', 'Итальянская кухня']);
            expect(result.cookingMethods).toEqual(['Варка', 'Жарка']);
        });

        test('должен работать с пустым массивом', () => {
            const result = separateTagsAndMethods([]);
            expect(result.tags).toEqual([]);
            expect(result.cookingMethods).toEqual([]);
        });

        test('должен работать с массивом строк', () => {
            const tags = ['Завтрак', 'method:Варка', 'Обед'];
            const result = separateTagsAndMethods(tags);

            expect(result.tags).toEqual(['Завтрак', 'Обед']);
            expect(result.cookingMethods).toEqual(['Варка']);
        });
    });

    describe('combineTagsAndMethods', () => {
        test('должен правильно объединять теги и методы', () => {
            const tags = ['Завтрак', 'Обед'];
            const methods = ['Варка', 'Жарка'];

            const result = combineTagsAndMethods(tags, methods);

            expect(result).toEqual([
                { name: 'Завтрак' },
                { name: 'Обед' },
                { name: 'method:Варка' },
                { name: 'method:Жарка' }
            ]);
        });

        test('должен работать с пустыми массивами', () => {
            const result = combineTagsAndMethods([], []);
            expect(result).toEqual([]);
        });
    });

    describe('isCookingMethod', () => {
        test('должен определять методы приготовления', () => {
            expect(isCookingMethod('method:Варка')).toBe(true);
            expect(isCookingMethod({ name: 'method:Жарка' })).toBe(true);
            expect(isCookingMethod('Завтрак')).toBe(false);
            expect(isCookingMethod({ name: 'Обед' })).toBe(false);
        });
    });

    describe('getCleanTagName', () => {
        test('должен возвращать чистое имя тега', () => {
            expect(getCleanTagName('method:Варка')).toBe('Варка');
            expect(getCleanTagName({ name: 'method:Жарка' })).toBe('Жарка');
            expect(getCleanTagName('Завтрак')).toBe('Завтрак');
            expect(getCleanTagName({ name: 'Обед' })).toBe('Обед');
        });
    });

    describe('filterTagsByType', () => {
        test('должен фильтровать теги по типу', () => {
            const tags = [
                { name: 'Завтрак' },
                { name: 'method:Варка' },
                { name: 'Обед' },
                { name: 'method:Жарка' }
            ];

            const regularTags = filterTagsByType(tags, 'tags');
            const methods = filterTagsByType(tags, 'methods');

            expect(regularTags).toEqual(['Завтрак', 'Обед']);
            expect(methods).toEqual(['Варка', 'Жарка']);
        });
    });
});
