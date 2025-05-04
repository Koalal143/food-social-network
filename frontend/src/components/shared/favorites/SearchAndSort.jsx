import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SearchAndSort({ searchQuery, setSearchQuery, sortBy, setSortBy }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="w-full md:w-1/2">
        <Input
          type="search"
          placeholder="Поиск по названию или описанию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="w-full md:w-1/4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Сортировать по" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">По дате добавления</SelectItem>
            <SelectItem value="name">По названию</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 