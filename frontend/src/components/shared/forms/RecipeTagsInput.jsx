import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { TAG_NAME_MAX_LENGTH } from '@/constants/validation';

/**
 * Компонент для управления тегами рецепта
 * Переиспользуемый между AddRecipeForm и EditRecipeForm
 */
const RecipeTagsInput = ({
    tags,
    tagInput,
    tagError,
    onTagInputChange,
    onAddTag,
    onRemoveTag,
    onTagInputKeyPress,
    canAddMoreTags,
    maxTagsCount,
}) => {
    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    type="text"
                    placeholder="Введите тег"
                    value={tagInput}
                    onChange={(e) => onTagInputChange(e.target.value)}
                    onKeyPress={onTagInputKeyPress}
                    maxLength={TAG_NAME_MAX_LENGTH}
                    disabled={!canAddMoreTags}
                />
                <Button
                    type="button"
                    onClick={onAddTag}
                    disabled={!canAddMoreTags || !tagInput.trim()}
                    variant="outline"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            
            {/* Отображение ошибки */}
            {tagError && (
                <p className="text-destructive text-sm">{tagError}</p>
            )}
            
            {/* Счетчик тегов */}
            <p className="text-sm text-muted-foreground">
                {tags.length} из {maxTagsCount} тегов
            </p>
            
            {/* Список добавленных тегов */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                        <Badge
                            key={`tag-${tag}-${index}`}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1"
                        >
                            <span>{tag}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 hover:bg-transparent"
                                onClick={() => onRemoveTag(index)}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecipeTagsInput;
