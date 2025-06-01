import { useState } from "react";
import { Input } from "../input";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from "../select";
import { Button } from "../button";

export default function SearchFilters({ filters, onChange }) {
    const [includeIngredients, setIncludeIngredients] = useState(filters.includeIngredients || []);
    const [excludeIngredients, setExcludeIngredients] = useState(filters.excludeIngredients || []);
    const [tags, setTags] = useState(filters.tags || []);
    const [cookTimeFrom, setCookTimeFrom] = useState(filters.cookTimeFrom || '');
    const [cookTimeTo, setCookTimeTo] = useState(filters.cookTimeTo || '');
    const [sortBy, setSortBy] = useState(filters.sortBy || '');

    const handleApplyFilters = () => {
        onChange({
            includeIngredients,
            excludeIngredients,
            tags,
            cookTimeFrom: cookTimeFrom ? parseInt(cookTimeFrom, 10) : null,
            cookTimeTo: cookTimeTo ? parseInt(cookTimeTo, 10) : null,
            sortBy,
        });
    };

    return (
        <div className="flex flex-wrap gap-4 mb-6">
            <Input
                type="text"
                placeholder="Ингредиенты для включения (через запятую)"
                value={includeIngredients.join(",")}
                onChange={e => setIncludeIngredients(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            />
            <Input
                type="text"
                placeholder="Ингредиенты для исключения (через запятую)"
                value={excludeIngredients.join(",")}
                onChange={e => setExcludeIngredients(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            />
            <Input
                type="text"
                placeholder="Теги (через запятую)"
                value={tags.join(",")}
                onChange={e => setTags(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            />
            <Input
                type="number"
                placeholder="Время приготовления от (мин)"
                value={cookTimeFrom}
                onChange={e => setCookTimeFrom(e.target.value)}
            />
            <Input
                type="number"
                placeholder="Время приготовления до (мин)"
                value={cookTimeTo}
                onChange={e => setCookTimeTo(e.target.value)}
            />
            <Select onValueChange={setSortBy} value={sortBy}>
                <SelectTrigger>
                    <SelectValue placeholder="Сначала" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="-created_at">Недавние</SelectItem>
                    <SelectItem value="created">Старые</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={handleApplyFilters}>Применить фильтры</Button>
        </div>
    );
}
